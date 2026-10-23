import math
from typing import Dict, List, Any, Optional
from backend.app.services.scoring_service import analyze_learner_gaps

STAGE_NAMES = {
    1: "Foundations",
    2: "Core Skills",
    3: "Applied Projects",
    4: "Employability & Career Readiness"
}

def generate_numeric_why(req: Dict[str, Any]) -> str:
    """
    Constructs a deterministic, transparent numeric explanation for the task recommendation.
    """
    req_id = req.get("req_id", "REQ")
    skill = req.get("skill", "Skill")
    req_level = req.get("required_level", 3)
    curr_level = req.get("current_level", 0)
    gap = req.get("gap", 0)
    priority = req.get("priority", 0.0)
    importance = req.get("importance", "Medium")

    return (
        f"Requirement {req_id} ({skill}) targets Level {req_level}; "
        f"your current assessed level is {curr_level} (Gap: {gap}, {importance} importance). "
        f"Calculated priority score: {priority}."
    )

def chunk_task_hours(total_hours: float, max_chunk: float) -> List[float]:
    """
    Divides an extensive task into sequential chunks that fit within weekly hours capacity.
    """
    if total_hours <= max_chunk:
        return [round(total_hours, 1)]
    chunks = []
    remaining = total_hours
    while remaining > 0:
        take = min(remaining, max_chunk)
        chunks.append(round(take, 1))
        remaining -= take
    return chunks

def build_staged_roadmap_tasks(
    role_data: Dict[str, Any],
    learner_profile: Dict[str, Any],
    gap_analysis: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Builds the prioritized, staged list of tasks from gap analysis and role templates.
    """
    reqs_by_id = {r["req_id"]: r for r in gap_analysis.get("requirements", [])}
    role_resources = role_data.get("learning_resources", [])
    project_templates = role_data.get("project_templates", [])
    
    tasks_raw = []

    # Map resources to requirement gaps
    resource_by_req = {}
    for res in role_resources:
        for r_id in res.get("covers_req_ids", []):
            if r_id not in resource_by_req:
                resource_by_req[r_id] = res

    # -------------------------------------------------------------
    # STAGE 1: Foundations
    # Focus: Gaps in foundational requirements or missing fundamental skills
    # -------------------------------------------------------------
    foundational_reqs = [
        r for r in gap_analysis.get("requirements", [])
        if (r.get("is_foundational") and r.get("gap", 0) > 0) or (r.get("status") == "Missing" and r.get("required_level", 1) <= 2)
    ]
    # If no explicitly foundational gaps, pick top gaps with lowest current levels
    if not foundational_reqs:
        foundational_reqs = [r for r in gap_analysis.get("requirements", []) if r.get("gap", 0) > 0][:2]

    for req in foundational_reqs:
        r_id = req["req_id"]
        res = resource_by_req.get(r_id)
        res_title = res.get("title", f"Fundamentals of {req['skill']}") if res else f"Official Documentation & Tutorials for {req['skill']}"
        res_url = res.get("url", "https://developer.mozilla.org/") if res else "https://freecodecamp.org/"
        est_hrs = min(res.get("est_hours", 6.0), 8.0) if res else 5.0

        tasks_raw.append({
            "stage": 1,
            "title": f"Master Foundations: {req['skill']}",
            "description": f"Study syntax, foundational principles, and core operations for {req['skill']}. Solve beginner practice exercises.",
            "linked_req_ids": [r_id],
            "numeric_why": generate_numeric_why(req),
            "resource_title": res_title,
            "resource_url": res_url,
            "est_hours": est_hrs,
            "success_criterion": f"Complete hands-on exercises covering basic syntax and workflow with zero syntax errors.",
            "evidence_artifact": f"GitHub repository or interactive lab notes demonstrating solved starter problems."
        })

    # Stage 1 Milestone Checkpoint
    s1_covered_ids = list({r_id for t in tasks_raw if t["stage"] == 1 for r_id in t["linked_req_ids"]})
    tasks_raw.append({
        "stage": 1,
        "title": "Stage 1 Milestone: Foundations Checkpoint & Self-Assessment",
        "description": "Review foundational concepts, verify starter code repositories, and re-rate initial confidence on assessed skills.",
        "linked_req_ids": s1_covered_ids if s1_covered_ids else [gap_analysis["requirements"][0]["req_id"]],
        "numeric_why": f"Validates baseline Level 2 readiness across {len(s1_covered_ids)} foundational requirements before advancing to core workflows.",
        "resource_title": "Self-Assessment Rubric Guide",
        "resource_url": "https://sfia-online.org/",
        "est_hours": 1.0,
        "success_criterion": "Self-rate understanding against Level 2 rubric indicators and record repository commit URLs.",
        "evidence_artifact": "Updated skill self-assessment ratings and public GitHub repository check."
    })

    # -------------------------------------------------------------
    # STAGE 2: Core Skills
    # Focus: Intermediate requirements, multi-table queries, component architecture, APIs
    # -------------------------------------------------------------
    core_reqs = [
        r for r in gap_analysis.get("requirements", [])
        if r.get("gap", 0) > 0 and r["req_id"] not in {t["linked_req_ids"][0] for t in tasks_raw if len(t["linked_req_ids"]) == 1}
    ]
    # If all gaps were handled in stage 1, take all non-zero gaps
    if not core_reqs:
        core_reqs = [r for r in gap_analysis.get("requirements", []) if r.get("gap", 0) > 0]

    for req in core_reqs:
        r_id = req["req_id"]
        res = resource_by_req.get(r_id)
        res_title = res.get("title", f"Core Deep Dive: {req['skill']}") if res else f"In-Depth Guide to {req['skill']}"
        res_url = res.get("url", "https://kaggle.com/learn") if res else "https://github.com/"
        est_hrs = res.get("est_hours", 8.0) if res else 7.0

        tasks_raw.append({
            "stage": 2,
            "title": f"Core Practice: {req['skill']}",
            "description": f"Implement intermediate patterns, error handling, and production-quality workflows for {req['skill']}.",
            "linked_req_ids": [r_id],
            "numeric_why": generate_numeric_why(req),
            "resource_title": res_title,
            "resource_url": res_url,
            "est_hours": est_hrs,
            "success_criterion": f"Build a tested mini-module or query pipeline satisfying Level 3 baseline criteria.",
            "evidence_artifact": f"Documented script, PR, or notebook demonstrating autonomous execution."
        })

    # Stage 2 Milestone Checkpoint
    s2_covered_ids = list({r_id for t in tasks_raw if t["stage"] == 2 for r_id in t["linked_req_ids"]})
    tasks_raw.append({
        "stage": 2,
        "title": "Stage 2 Milestone: Core Competency Audit & Code Review",
        "description": "Conduct a comprehensive review of all core code modules. Ensure compliance with Level 3 industry rubric expectations.",
        "linked_req_ids": s2_covered_ids if s2_covered_ids else [gap_analysis["requirements"][0]["req_id"]],
        "numeric_why": f"Confirms Level 3 baseline readiness across {len(s2_covered_ids)} core requirements prior to starting capstone project work.",
        "resource_title": "Clean Code & Rubric Standards",
        "resource_url": "https://github.com/ryanmcdermott/clean-code-javascript",
        "est_hours": 1.0,
        "success_criterion": "All core practice modules committed to GitHub with passing unit tests / query verification.",
        "evidence_artifact": "Consolidated GitHub branch review and Stage 2 sign-off."
    })

    # -------------------------------------------------------------
    # STAGE 3: Applied Projects
    # Focus: Comprehensive capstone templates combining multiple requirements
    # -------------------------------------------------------------
    for proj in project_templates:
        proj_req_ids = proj.get("skills_demonstrated", [])
        # Match against actual gaps covered
        covered_gaps = [reqs_by_id[r_id] for r_id in proj_req_ids if r_id in reqs_by_id]
        avg_priority = round(sum(r["priority"] for r in covered_gaps) / len(covered_gaps), 1) if covered_gaps else 4.0
        
        why_text = (
            f"Synthesizes multiple Requirements ({', '.join(proj_req_ids)}). "
            f"Targets critical applied gap competencies with combined average priority score of {avg_priority}."
        )

        tasks_raw.append({
            "stage": 3,
            "title": f"Applied Project: {proj['title']}",
            "description": proj.get("brief", "Comprehensive hands-on implementation."),
            "linked_req_ids": proj_req_ids,
            "numeric_why": why_text,
            "resource_title": f"Project Specification: {proj['title']}",
            "resource_url": "https://github.com/",
            "est_hours": proj.get("est_hours", 16.0),
            "success_criterion": f"Fulfill deliverables: {'; '.join(proj.get('deliverables', ['Complete deliverable']))}.",
            "evidence_artifact": proj.get("evidence_output", "Public GitHub repository with full documentation.")
        })

    # Stage 3 Milestone Checkpoint
    s3_covered_ids = list({r_id for t in tasks_raw if t["stage"] == 3 for r_id in t["linked_req_ids"]})
    tasks_raw.append({
        "stage": 3,
        "title": "Stage 3 Milestone: Capstone Artifact Verification",
        "description": "Verify live demo links, README badges, dataset documentation, and reproducible instructions for all projects.",
        "linked_req_ids": s3_covered_ids if s3_covered_ids else [gap_analysis["requirements"][0]["req_id"]],
        "numeric_why": f"Validates Level 3 artifact readiness across {len(s3_covered_ids)} project requirements for external review.",
        "resource_title": "Project README Best Practices Guide",
        "resource_url": "https://github.com/matiassingers/awesome-readme",
        "est_hours": 1.0,
        "success_criterion": "All project deliverables published with live URLs and documented setups.",
        "evidence_artifact": "Live deployed project link or active GitHub repository with badges."
    })

    # -------------------------------------------------------------
    # STAGE 4: Employability & Career Readiness
    # Focus: CV bullets, technical narrative, interview prep, GitHub/LinkedIn evidence
    # -------------------------------------------------------------
    all_top_req_ids = [r["req_id"] for r in gap_analysis.get("requirements", [])[:3]]
    
    tasks_raw.append({
        "stage": 4,
        "title": "Employability: Impact-Driven CV & Portfolio Bullets",
        "description": "Formulate 4-6 STAR-format resume bullet points directly tying completed projects and skills to measurable business outcomes.",
        "linked_req_ids": all_top_req_ids,
        "numeric_why": f"Translates newly acquired Level 3 readiness into recruiter-scannable bullet points for Requirements ({', '.join(all_top_req_ids)}).",
        "resource_title": "Tech Resume & Portfolio Evidence Guide",
        "resource_url": "https://www.careercup.com/",
        "est_hours": 4.0,
        "success_criterion": "Write 4 quantified bullet points (Action + Context + Metric) for each Stage 3 project.",
        "evidence_artifact": "PDF Resume draft and public portfolio page link."
    })

    tasks_raw.append({
        "stage": 4,
        "title": "Employability: Technical Interview & Architecture Defense",
        "description": "Practice explaining trade-offs, architecture decisions, database normalization, and edge case handling for your projects.",
        "linked_req_ids": all_top_req_ids,
        "numeric_why": f"Validates readiness to articulate Level 3 technical decisions under interview scrutiny for Requirements ({', '.join(all_top_req_ids)}).",
        "resource_title": "Role-Specific Technical Interview Question Bank",
        "resource_url": "https://github.com/yangshun/tech-interview-handbook",
        "est_hours": 6.0,
        "success_criterion": "Conduct mock interview recording or written defense answers for 10 common role scenarios.",
        "evidence_artifact": "Recorded mock interview transcript or written technical defense document."
    })

    tasks_raw.append({
        "stage": 4,
        "title": "Stage 4 Milestone: Comprehensive Job-Readiness Audit",
        "description": "Final verification of all portfolio artifacts, LinkedIn skill alignments, and target framework coverage.",
        "linked_req_ids": all_top_req_ids,
        "numeric_why": f"Validates comprehensive Level 3 readiness across target benchmark framework Requirements ({', '.join(all_top_req_ids)}).",
        "resource_title": "Job Readiness Checklist",
        "resource_url": "https://sfia-online.org/",
        "est_hours": 1.0,
        "success_criterion": "Complete 100% of checklist items with active public evidence links.",
        "evidence_artifact": "Consolidated Employability Dossier (Resume + GitHub + Live Demos)."
    })

    return tasks_raw

def schedule_tasks_into_weeks(
    tasks: List[Dict[str, Any]],
    available_hours_per_week: float
) -> List[Dict[str, Any]]:
    """
    Packs tasks sequentially into weeks such that weekly planned hours NEVER exceed available_hours_per_week.
    Large tasks are decomposed into sequential numbered parts if they exceed weekly capacity.
    """
    weekly_limit = max(1.0, float(available_hours_per_week))
    scheduled_tasks = []
    
    current_week = 1
    current_week_hours = 0.0

    for task in tasks:
        task_hours = float(task.get("est_hours", 1.0))

        # Check if the task itself exceeds the weekly limit
        if task_hours > weekly_limit:
            # Chunk the task into sequential parts
            chunks = chunk_task_hours(task_hours, weekly_limit)
            for part_idx, chunk_hrs in enumerate(chunks, 1):
                # If current week doesn't have room for chunk_hrs, move to next week
                if current_week_hours + chunk_hrs > weekly_limit and current_week_hours > 0:
                    current_week += 1
                    current_week_hours = 0.0

                part_task = dict(task)
                part_task["title"] = f"{task['title']} (Part {part_idx}/{len(chunks)})"
                part_task["est_hours"] = chunk_hrs
                part_task["week_number"] = current_week
                scheduled_tasks.append(part_task)

                current_week_hours += chunk_hrs
                if current_week_hours >= weekly_limit:
                    current_week += 1
                    current_week_hours = 0.0
        else:
            # Task fits within weekly limit
            if current_week_hours + task_hours > weekly_limit and current_week_hours > 0:
                current_week += 1
                current_week_hours = 0.0

            scheduled_task = dict(task)
            scheduled_task["week_number"] = current_week
            scheduled_tasks.append(scheduled_task)
            current_week_hours += task_hours

            if current_week_hours >= weekly_limit:
                current_week += 1
                current_week_hours = 0.0

    return scheduled_tasks

def generate_roadmap(
    role_data: Dict[str, Any],
    learner_profile: Dict[str, Any],
    learner_skills: List[Dict[str, Any]],
    available_hours: float
) -> Dict[str, Any]:
    """
    End-to-end roadmap generation pipeline.
    """
    gap_analysis = analyze_learner_gaps(
        role_data=role_data,
        learner_skills_list=learner_skills,
        learner_interests=learner_profile.get("interests", [])
    )

    raw_tasks = build_staged_roadmap_tasks(role_data, learner_profile, gap_analysis)
    scheduled_tasks = schedule_tasks_into_weeks(raw_tasks, available_hours)

    total_hours = sum(t["est_hours"] for t in scheduled_tasks)
    total_weeks = max(t["week_number"] for t in scheduled_tasks) if scheduled_tasks else 1

    return {
        "role_id": role_data.get("role_id"),
        "role_title": role_data.get("title"),
        "total_planned_hours": round(total_hours, 1),
        "total_weeks": total_weeks,
        "available_hours_per_week": available_hours,
        "tasks": scheduled_tasks,
        "gap_analysis": gap_analysis
    }
