import pytest
from backend.app.services.role_service import load_roles, get_role_by_id
from backend.app.services.roadmap_service import generate_roadmap
from backend.app.services.replan_service import compute_replan

def test_replan_preserves_completed_tasks_and_diffs_on_hours_change():
    roles = load_roles(force_reload=True)
    da_role = roles["data_analyst"]

    profile = {"alias": "Jordan Miller", "target_role_id": "data_analyst", "interests": ["Analytics"]}
    skills = [
        {"skill_name": "Spreadsheet Modeling & Advanced Formulas", "current_level": 2},
        {"skill_name": "Relational Databases & SQL Querying", "current_level": 1}
    ]

    initial = generate_roadmap(da_role, profile, skills, available_hours=6.0)
    tasks = initial["tasks"]

    # Mark the first two tasks as completed
    tasks[0]["status"] = "completed"
    tasks[0]["logged_hours"] = tasks[0]["est_hours"]
    tasks[1]["status"] = "completed"
    tasks[1]["logged_hours"] = tasks[1]["est_hours"]

    # Replan with reduced hours: 3.0 hrs/week
    replan_result = compute_replan(
        existing_tasks=tasks,
        current_role_data=da_role,
        new_role_data=da_role,
        learner_profile=profile,
        current_skills=skills,
        new_hours_per_week=3.0,
        old_hours_per_week=6.0,
        reason="Weekly capacity dropped from 6 to 3 hrs/week"
    )

    diff = replan_result["diff"]
    new_tasks = replan_result["tasks"]

    # Assert completed tasks are preserved
    completed_in_new = [t for t in new_tasks if t.get("status") == "completed"]
    assert len(completed_in_new) == 2
    assert completed_in_new[0]["title"] == tasks[0]["title"]
    assert completed_in_new[1]["title"] == tasks[1]["title"]

    # Assert diff metrics
    assert diff["tasks_retained"] >= 2
    assert diff["weeks_delta"] > 0, "Lower hours should increase total weeks"
    assert "moved" in diff["summary"] or "rescheduled" in diff["summary"]

