import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check_and_disclaimer():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "guidance, not guarantees" in data["disclaimer"]

def test_list_and_get_roles():
    response = client.get("/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) >= 3
    role_ids = [r["role_id"] for r in roles]
    assert "data_analyst" in role_ids
    assert "junior_fullstack_dev" in role_ids
    assert "cloud_devops_associate" in role_ids

    # Detail check
    da_resp = client.get("/roles/data_analyst")
    assert da_resp.status_code == 200
    da_data = da_resp.json()
    assert len(da_data["requirements"]) >= 8
    assert "O*NET" in da_data["source"]

def test_seeded_learners_exist():
    response = client.get("/learners")
    assert response.status_code == 200
    learners = response.json()
    ids = [l["id"] for l in learners]
    assert "learner-a-jordan-miller" in ids
    assert "learner-b-alex-chen" in ids

def test_learner_lifecycle_and_analysis_and_roadmap():
    # 1. Create custom learner
    create_payload = {
        "alias": "Morgan Taylor",
        "current_role": "Customer Success Specialist",
        "education": "B.A. in Communications",
        "target_role_id": "data_analyst",
        "preferred_learning_style": "Hands-on Projects",
        "available_hours_per_week": 8.0,
        "target_completion_date": "2026-12-01",
        "interests": ["Data Storytelling", "Dashboards"],
        "skills": [
            {"skill_name": "Spreadsheet Modeling & Advanced Formulas", "current_level": 2, "proof_url": "https://example.com/sheet"},
            {"skill_name": "Relational Databases & SQL Querying", "current_level": 1, "proof_url": None}
        ],
        "experiences": [
            {"title": "CS Specialist", "organization": "SaaS Co", "duration": "2 yrs", "description": "Resolved client issues"}
        ]
    }
    create_resp = client.post("/learners", json=create_payload)
    assert create_resp.status_code == 201
    learner = create_resp.json()
    learner_id = learner["id"]
    assert learner["alias"] == "Morgan Taylor"
    assert len(learner["skills"]) == 2

    # 2. Run Gap Analysis
    analysis_resp = client.post(f"/learners/{learner_id}/analysis")
    assert analysis_resp.status_code == 200
    analysis = analysis_resp.json()
    assert "readiness_percentage" in analysis
    assert analysis["total_requirements"] >= 8
    assert analysis["readiness_percentage"] > 0.0

    # 3. Generate Roadmap
    roadmap_resp = client.post(f"/learners/{learner_id}/roadmap")
    assert roadmap_resp.status_code == 200
    roadmap = roadmap_resp.json()
    assert len(roadmap["stages"]) == 4
    assert len(roadmap["tasks"]) > 0
    first_task = roadmap["tasks"][0]
    task_id = first_task["id"]

    # 4. Update task (log progress and evidence)
    patch_resp = client.patch(f"/tasks/{task_id}", json={
        "status": "completed",
        "logged_hours": 4.0,
        "evidence_link": "https://github.com/morgantaylor/sql-lab-1"
    })
    assert patch_resp.status_code == 200
    updated_task = patch_resp.json()
    assert updated_task["status"] == "completed"
    assert updated_task["logged_hours"] == 4.0
    assert updated_task["evidence_link"] == "https://github.com/morgantaylor/sql-lab-1"

    # 5. Check Progress endpoint
    prog_resp = client.get(f"/learners/{learner_id}/progress")
    assert prog_resp.status_code == 200
    prog = prog_resp.json()
    assert prog["total_logged_hours"] == 4.0
    assert len(prog["next_three_actions"]) <= 3

    # 6. Replan with reduced weekly hours
    replan_resp = client.post(f"/learners/{learner_id}/replan", json={
        "new_available_hours_per_week": 4.0,
        "reason": "Reduced available hours due to workload"
    })
    assert replan_resp.status_code == 200
    replan_data = replan_resp.json()
    assert "diff" in replan_data
    assert replan_data["diff"]["new_hours_per_week"] == 4.0
    # Completed task should still be completed in new roadmap
    new_completed = [t for t in replan_data["roadmap"]["tasks"] if t["status"] == "completed"]
    assert len(new_completed) >= 1

    # 7. Delete learner (data sovereignty check)
    del_resp = client.delete(f"/learners/{learner_id}")
    assert del_resp.status_code == 204

    # Verify deleted
    get_deleted = client.get(f"/learners/{learner_id}")
    assert get_deleted.status_code == 404

