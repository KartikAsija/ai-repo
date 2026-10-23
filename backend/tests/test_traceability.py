import pytest
from backend.app.services.role_service import load_roles, get_role_by_id
from backend.app.services.roadmap_service import generate_roadmap

def test_every_task_has_valid_req_id_and_numeric_why():
    roles = load_roles(force_reload=True)
    assert len(roles) >= 3, "Must test at least 3 roles"

    for role_id, role_data in roles.items():
        valid_req_ids = {r["req_id"] for r in role_data.get("requirements", [])}

        learner_profile = {
            "alias": "Test Candidate",
            "target_role_id": role_id,
            "interests": ["Data", "Web", "Cloud"]
        }
        # Learner with minimal initial skills
        skills = [{"skill_name": role_data["requirements"][0]["skill"], "current_level": 1}]

        roadmap_result = generate_roadmap(
            role_data=role_data,
            learner_profile=learner_profile,
            learner_skills=skills,
            available_hours=10.0
        )

        tasks = roadmap_result["tasks"]
        assert len(tasks) > 0, f"Role {role_id} must generate tasks"

        for task in tasks:
            linked_ids = task.get("linked_req_ids", [])
            assert len(linked_ids) > 0, f"Task '{task['title']}' must have linked_req_ids"
            for r_id in linked_ids:
                assert r_id in valid_req_ids, f"Task '{task['title']}' has unknown req_id {r_id} for role {role_id}"

            # Verify numeric why
            why = task.get("numeric_why", "")
            assert len(why) > 10, f"Task '{task['title']}' must have detailed numeric_why"
            assert ("Level" in why or "Requirement" in why or "readiness" in why.lower()), f"Numeric why must explain gap: {why}"

            # Verify evidence artifact
            evidence = task.get("evidence_artifact", "")
            assert len(evidence) > 5, f"Task '{task['title']}' must specify an evidence_artifact"

