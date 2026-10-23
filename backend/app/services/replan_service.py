from typing import Dict, List, Any, Optional
from backend.app.services.roadmap_service import (
    build_staged_roadmap_tasks,
    schedule_tasks_into_weeks
)
from backend.app.services.scoring_service import analyze_learner_gaps

def compute_replan(
    existing_tasks: List[Dict[str, Any]],
    current_role_data: Dict[str, Any],
    new_role_data: Dict[str, Any],
    learner_profile: Dict[str, Any],
    current_skills: List[Dict[str, Any]],
    new_hours_per_week: float,
    old_hours_per_week: float,
    reason: str = "Learner profile update"
) -> Dict[str, Any]:
    """
    Computes a replanned roadmap preserving completed tasks and producing an audited diff.
    """
    # 1. Segregate completed tasks vs incomplete tasks
    completed_tasks = [t for t in existing_tasks if t.get("status") == "completed"]
    completed_req_ids = set()
    for t in completed_tasks:
        for r_id in t.get("linked_req_ids", []):
            completed_req_ids.add(r_id)

    # 2. Re-run gap analysis for the (potentially new) role
    gap_analysis = analyze_learner_gaps(
        role_data=new_role_data,
        learner_skills_list=current_skills,
        learner_interests=learner_profile.get("interests", [])
    )

    # 3. Generate raw tasks for the new state
    new_raw_tasks = build_staged_roadmap_tasks(new_role_data, learner_profile, gap_analysis)

    # Filter out raw tasks if their primary requirements have already been completed
    filtered_new_tasks = []
    for t in new_raw_tasks:
        # If this is a milestone task, keep it if it belongs to an uncompleted stage
        # or if the task's linked reqs are not all completed
        t_reqs = set(t.get("linked_req_ids", []))
        if t_reqs and t_reqs.issubset(completed_req_ids) and t.get("stage") <= max([c.get("stage", 1) for c in completed_tasks], default=0):
            continue
        filtered_new_tasks.append(t)

    # 4. Schedule new tasks sequentially, starting after completed tasks
    completed_weeks = max([t.get("week_number", 0) for t in completed_tasks], default=0)
    
    # Reschedule incomplete tasks into weeks with new_hours_per_week
    rescheduled_uncompleted = schedule_tasks_into_weeks(filtered_new_tasks, new_hours_per_week)
    
    # Offset week numbers by the completed weeks
    for t in rescheduled_uncompleted:
        t["week_number"] += completed_weeks

    # Combine completed tasks + rescheduled tasks
    all_final_tasks = completed_tasks + rescheduled_uncompleted

    # 5. Compute Diff
    old_task_titles = {t.get("title"): t for t in existing_tasks if t.get("status") != "completed"}
    new_task_titles = {t.get("title"): t for t in rescheduled_uncompleted}

    tasks_retained = len(completed_tasks)
    tasks_rescheduled = 0
    tasks_added = 0
    tasks_removed = 0
    diff_details = []

    # Check common uncompleted tasks that shifted weeks
    for title, old_t in old_task_titles.items():
        if title in new_task_titles:
            new_t = new_task_titles[title]
            tasks_retained += 1
            if new_t["week_number"] != old_t["week_number"]:
                tasks_rescheduled += 1
                diff_details.append({
                    "type": "rescheduled",
                    "title": title,
                    "old_week": old_t["week_number"],
                    "new_week": new_t["week_number"],
                    "reason": f"Shifted from Week {old_t['week_number']} to Week {new_t['week_number']} to fit {new_hours_per_week}h/week budget"
                })
        else:
            tasks_removed += 1
            diff_details.append({
                "type": "removed",
                "title": title,
                "reason": "Superseded by updated role framework requirements or modified schedule"
            })

    for title, new_t in new_task_titles.items():
        if title not in old_task_titles:
            tasks_added += 1
            diff_details.append({
                "type": "added",
                "title": title,
                "new_week": new_t["week_number"],
                "reason": "Added to address new role framework requirement gaps"
            })

    old_total_weeks = max([t.get("week_number", 1) for t in existing_tasks], default=1)
    new_total_weeks = max([t.get("week_number", 1) for t in all_final_tasks], default=1)
    weeks_delta = new_total_weeks - old_total_weeks

    # Human-friendly summary string
    delta_str = f"+{weeks_delta} weeks" if weeks_delta > 0 else (f"{weeks_delta} weeks" if weeks_delta < 0 else "timeline duration unchanged")
    summary = (
        f"{tasks_rescheduled} tasks moved, {tasks_added} added, {tasks_removed} removed, timeline {delta_str} "
        f"({tasks_retained} completed/reused)."
    )

    diff_report = {
        "reason": reason,
        "summary": summary,
        "tasks_retained": tasks_retained,
        "tasks_rescheduled": tasks_rescheduled,
        "tasks_added": tasks_added,
        "tasks_removed": tasks_removed,
        "weeks_delta": weeks_delta,
        "old_total_weeks": old_total_weeks,
        "new_total_weeks": new_total_weeks,
        "old_hours_per_week": old_hours_per_week,
        "new_hours_per_week": new_hours_per_week,
        "details": diff_details
    }

    return {
        "tasks": all_final_tasks,
        "diff": diff_report,
        "total_planned_hours": round(sum(t.get("est_hours", 0) for t in all_final_tasks), 1),
        "total_weeks": new_total_weeks,
        "gap_analysis": gap_analysis
    }

