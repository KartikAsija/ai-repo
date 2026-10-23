from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.seed_service import seed_demo_learners, LEARNER_A_ID, LEARNER_B_ID
from backend.app.models.schema import Learner, Roadmap, RoadmapTask, LearnerSkill
from backend.app.routers.replan import replan_learner_roadmap
from backend.app.schemas.replan import ReplanRequest

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/seed")
def seed_demo_endpoint(db: Session = Depends(get_db)):
    seed_demo_learners(db)
    return {
        "status": "success",
        "message": "Demo learners Jordan Miller and Alex Chen seeded successfully.",
        "learner_a_id": LEARNER_A_ID,
        "learner_b_id": LEARNER_B_ID
    }

@router.post("/simulate-step/{learner_key}")
def simulate_demo_step(learner_key: str, db: Session = Depends(get_db)):
    learner_key = learner_key.lower().strip()

    if learner_key in ["a", "jordan", "learner-a-jordan-miller"]:
        learner = db.query(Learner).filter(Learner.id == LEARNER_A_ID).first()
        if not learner:
            seed_demo_learners(db)
            learner = db.query(Learner).filter(Learner.id == LEARNER_A_ID).first()

        # 1. Complete the first two tasks in Jordan's active roadmap
        roadmap = db.query(Roadmap).filter(Roadmap.learner_id == LEARNER_A_ID, Roadmap.is_active == True).first()
        if roadmap:
            tasks = sorted(roadmap.tasks, key=lambda t: (t.week_number, t.task_order))
            if len(tasks) >= 1:
                tasks[0].status = "completed"
                tasks[0].logged_hours = tasks[0].est_hours
                tasks[0].evidence_link = "https://github.com/jordan-miller/sql-foundations-starter"
                tasks[0].completed_at = datetime.utcnow()
            if len(tasks) >= 2:
                tasks[1].status = "completed"
                tasks[1].logged_hours = tasks[1].est_hours
                tasks[1].evidence_link = "https://github.com/jordan-miller/excel-inventory-model"
                tasks[1].completed_at = datetime.utcnow()
            db.commit()

        # 2. Trigger replan: Jordan's available hours drop from 6.0 to 3.0 hrs/week
        replan_req = ReplanRequest(
            new_available_hours_per_week=3.0,
            reason="Jordan's work shift changed, reducing weekly study hours from 6h/wk to 3h/wk"
        )
        replan_resp = replan_learner_roadmap(LEARNER_A_ID, replan_req, db)
        return {
            "learner_id": LEARNER_A_ID,
            "alias": learner.alias,
            "step": "Jordan: Completed 2 tasks -> Hours reduced 6h/wk to 3h/wk -> Replanned",
            "diff": replan_resp.diff
        }

    elif learner_key in ["b", "alex", "learner-b-alex-chen"]:
        learner = db.query(Learner).filter(Learner.id == LEARNER_B_ID).first()
        if not learner:
            seed_demo_learners(db)
            learner = db.query(Learner).filter(Learner.id == LEARNER_B_ID).first()

        # 1. Complete the first task in Alex's active roadmap
        roadmap = db.query(Roadmap).filter(Roadmap.learner_id == LEARNER_B_ID, Roadmap.is_active == True).first()
        if roadmap:
            tasks = sorted(roadmap.tasks, key=lambda t: (t.week_number, t.task_order))
            if len(tasks) >= 1:
                tasks[0].status = "completed"
                tasks[0].logged_hours = tasks[0].est_hours
                tasks[0].evidence_link = "https://github.com/alexchen-demo/fullstack-vitest-suite"
                tasks[0].completed_at = datetime.utcnow()
            db.commit()

        # 2. Trigger replan: Alex pivots target role from junior_fullstack_dev to cloud_devops_associate
        replan_req = ReplanRequest(
            new_target_role_id="cloud_devops_associate",
            reason="Alex pivoted career focus from Full-Stack to Cloud & DevOps Associate"
        )
        replan_resp = replan_learner_roadmap(LEARNER_B_ID, replan_req, db)
        return {
            "learner_id": LEARNER_B_ID,
            "alias": learner.alias,
            "step": "Alex: Completed 1 task -> Pivoted target role to Cloud/DevOps Associate -> Replanned",
            "diff": replan_resp.diff
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid learner key. Use 'a' or 'b'.")

