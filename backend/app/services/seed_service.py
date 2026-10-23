import json
from sqlalchemy.orm import Session
from backend.app.models.schema import Learner, LearnerSkill, LearnerExperience
from backend.app.services.role_service import get_role_by_id
from backend.app.services.roadmap_service import generate_roadmap
from backend.app.models.schema import Roadmap, RoadmapTask

LEARNER_A_ID = "learner-a-jordan-miller"
LEARNER_B_ID = "learner-b-alex-chen"

def seed_demo_learners(db: Session):
    """
    Seeds Learner A (Jordan Miller) and Learner B (Alex Chen) if they don't already exist.
    """
    # Check if Learner A exists
    existing_a = db.query(Learner).filter(Learner.id == LEARNER_A_ID).first()
    if not existing_a:
        learner_a = Learner(
            id=LEARNER_A_ID,
            alias="Jordan Miller (Career Changer)",
            current_role="Retail Store Manager",
            education="B.A. in Business Administration",
            target_role_id="data_analyst",
            preferred_learning_style="Hands-on Projects & Guided Practice",
            available_hours_per_week=6.0,
            target_completion_date="2026-08-30",
            interests=json.dumps(["Retail Analytics", "SQL", "Tableau", "Executive Storytelling"])
        )
        db.add(learner_a)
        db.flush()

        skills_a = [
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Spreadsheet Modeling & Advanced Formulas", current_level=2, proof_url="https://docs.google.com/spreadsheets/d/demo-retail-inventory", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Relational Databases & SQL Querying", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Data Cleaning & Transformation with Python", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Exploratory Data Analysis & Statistics", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Business Intelligence Dashboards", current_level=0, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Stakeholder Presentation & Storytelling", current_level=4, proof_url="https://linkedin.com/in/demo-jordan-miller", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Data Governance, Ethics & Privacy", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_A_ID, skill_name="Version Control & Project Documentation", current_level=1, proof_url=None, verification_status="unverified")
        ]
        for s in skills_a:
            db.add(s)

        exp_a = LearnerExperience(
            learner_id=LEARNER_A_ID,
            title="General Store Operations Manager",
            organization="Apex Retail Corp",
            duration="2019 - Present (7 years)",
            description="Supervised team of 18 associates, tracked store P&L spreadsheets, optimized weekly inventory restocking, and reported KPIs to regional leadership."
        )
        db.add(exp_a)
        db.commit()

        # Generate initial roadmap for Learner A
        da_role = get_role_by_id("data_analyst")
        if da_role:
            skills_dict_list = [{"skill_name": s.skill_name, "current_level": s.current_level, "proof_url": s.proof_url} for s in skills_a]
            profile_dict = {"alias": learner_a.alias, "target_role_id": "data_analyst", "interests": ["Retail Analytics", "SQL", "Tableau"]}
            roadmap_gen = generate_roadmap(da_role, profile_dict, skills_dict_list, 6.0)

            db_roadmap = Roadmap(
                learner_id=LEARNER_A_ID,
                role_id="data_analyst",
                version=1,
                is_active=True,
                total_planned_hours=roadmap_gen["total_planned_hours"],
                total_weeks=roadmap_gen["total_weeks"]
            )
            db.add(db_roadmap)
            db.flush()

            for idx, t in enumerate(roadmap_gen["tasks"]):
                task_row = RoadmapTask(
                    roadmap_id=db_roadmap.id,
                    stage=t["stage"],
                    week_number=t["week_number"],
                    task_order=idx + 1,
                    title=t["title"],
                    description=t.get("description"),
                    linked_req_ids=json.dumps(t.get("linked_req_ids", [])),
                    numeric_why=t["numeric_why"],
                    resource_title=t.get("resource_title"),
                    resource_url=t.get("resource_url"),
                    est_hours=t["est_hours"],
                    logged_hours=0.0,
                    success_criterion=t.get("success_criterion"),
                    evidence_artifact=t.get("evidence_artifact"),
                    status="todo"
                )
                db.add(task_row)
            db.commit()

    # Check if Learner B exists
    existing_b = db.query(Learner).filter(Learner.id == LEARNER_B_ID).first()
    if not existing_b:
        learner_b = Learner(
            id=LEARNER_B_ID,
            alias="Alex Chen (CS Graduate)",
            current_role="Final-Year Computer Science Undergraduate",
            education="B.S. in Computer Science (Senior)",
            target_role_id="junior_fullstack_dev",
            preferred_learning_style="Documentation & Project Building",
            available_hours_per_week=15.0,
            target_completion_date="2026-06-15",
            interests=json.dumps(["Full-Stack Web", "Cloud Infrastructure", "CI/CD"])
        )
        db.add(learner_b)
        db.flush()

        skills_b = [
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Modern JavaScript & TypeScript Fundamentals", current_level=3, proof_url="https://github.com/alexchen-demo/ts-algorithms", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="React Component Architecture & State Management", current_level=2, proof_url="https://github.com/alexchen-demo/react-todo-app", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Backend REST API Development", current_level=3, proof_url="https://github.com/alexchen-demo/fastapi-demo-store", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Relational Databases & ORM Integration", current_level=2, proof_url="https://github.com/alexchen-demo/sql-schema-lab", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Automated Testing & Test-Driven Development", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Git Collaboration & Pull Request Workflow", current_level=3, proof_url="https://github.com/alexchen-demo", verification_status="verified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Web Security Fundamentals", current_level=1, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Responsive Styling & Web Accessibility (a11y)", current_level=2, proof_url=None, verification_status="unverified"),
            LearnerSkill(learner_id=LEARNER_B_ID, skill_name="Containerization Basics with Docker", current_level=1, proof_url=None, verification_status="unverified")
        ]
        for s in skills_b:
            db.add(s)

        exp_b = LearnerExperience(
            learner_id=LEARNER_B_ID,
            title="Undergraduate Research Assistant (Data Structures Lab)",
            organization="University Department of Computer Science",
            duration="2025 - Present (1 year)",
            description="Assisted in automated code test harnesses, graded Java lab submissions, and implemented graph algorithms."
        )
        db.add(exp_b)
        db.commit()

        # Generate initial roadmap for Learner B
        fs_role = get_role_by_id("junior_fullstack_dev")
        if fs_role:
            skills_dict_list = [{"skill_name": s.skill_name, "current_level": s.current_level, "proof_url": s.proof_url} for s in skills_b]
            profile_dict = {"alias": learner_b.alias, "target_role_id": "junior_fullstack_dev", "interests": ["Full-Stack Web", "CI/CD"]}
            roadmap_gen = generate_roadmap(fs_role, profile_dict, skills_dict_list, 15.0)

            db_roadmap = Roadmap(
                learner_id=LEARNER_B_ID,
                role_id="junior_fullstack_dev",
                version=1,
                is_active=True,
                total_planned_hours=roadmap_gen["total_planned_hours"],
                total_weeks=roadmap_gen["total_weeks"]
            )
            db.add(db_roadmap)
            db.flush()

            for idx, t in enumerate(roadmap_gen["tasks"]):
                task_row = RoadmapTask(
                    roadmap_id=db_roadmap.id,
                    stage=t["stage"],
                    week_number=t["week_number"],
                    task_order=idx + 1,
                    title=t["title"],
                    description=t.get("description"),
                    linked_req_ids=json.dumps(t.get("linked_req_ids", [])),
                    numeric_why=t["numeric_why"],
                    resource_title=t.get("resource_title"),
                    resource_url=t.get("resource_url"),
                    est_hours=t["est_hours"],
                    logged_hours=0.0,
                    success_criterion=t.get("success_criterion"),
                    evidence_artifact=t.get("evidence_artifact"),
                    status="todo"
                )
                db.add(task_row)
            db.commit()

