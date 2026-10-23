from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Learner, Roadmap, RoadmapTask
from backend.app.schemas.progress import ProgressResponse, StageProgress
from backend.app.services.role_service import get_role_by_id
from backend.app.services.scoring_service import calculate_readiness_percentage
from backend.app.services.roadmap_service import STAGE_NAMES
from backend.app.routers.roadmap import serialize_task_model

router = APIRouter(prefix="/learners", tags=["Progress"])

@router.get("/{learner_id}/progress", response_model=ProgressResponse)
def get_learner_progress(learner_id: str, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    role = get_role_by_id(learner.target_role_id)
    role_title = role.get("title", learner.target_role_id) if role else learner.target_role_id

    # Compute current readiness against framework
    readiness = 0.0
    if role:
        user_skills_map = {s.skill_name: {"current_level": s.current_level} for s in learner.skills}
        readiness = calculate_readiness_percentage(role.get("requirements", []), user_skills_map)

    # Active roadmap
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.learner_id == learner_id, Roadmap.is_active == True)
        .order_by(Roadmap.version.desc())
        .first()
    )

    total_planned = 0.0
    total_logged = 0.0
    total_weeks = 1
    current_week = 1
    stages_progress = []
    next_three = []

    if roadmap:
        total_planned = roadmap.total_planned_hours
        total_weeks = roadmap.total_weeks

        # Sort tasks by week_number then task_order
        tasks = sorted(roadmap.tasks, key=lambda t: (t.week_number, t.task_order))
        total_logged = sum(t.logged_hours or 0.0 for t in tasks)

        # Stage breakdown
        for stg in [1, 2, 3, 4]:
            stg_tasks = [t for t in tasks if t.stage == stg]
            stg_completed = sum(1 for t in stg_tasks if t.status == "completed")
            stg_count = len(stg_tasks)
            stg_pct = round((stg_completed / stg_count * 100.0), 1) if stg_count > 0 else 0.0

            stages_progress.append(StageProgress(
                stage=stg,
                stage_name=STAGE_NAMES.get(stg, f"Stage {stg}"),
                completed_tasks=stg_completed,
                total_tasks=stg_count,
                completion_percentage=stg_pct
            ))

        # Next 3 actions (first 3 incomplete tasks)
        incomplete = [t for t in tasks if t.status not in ["completed", "skipped"]]
        if incomplete:
            current_week = incomplete[0].week_number
            next_three = [serialize_task_model(t) for t in incomplete[:3]]
        else:
            current_week = total_weeks

    completed_tasks_total = sum(sp.completed_tasks for sp in stages_progress)
    all_tasks_total = sum(sp.total_tasks for sp in stages_progress)
    overall_pct = round((completed_tasks_total / all_tasks_total * 100.0), 1) if all_tasks_total > 0 else 0.0

    return ProgressResponse(
        learner_id=learner.id,
        alias=learner.alias,
        target_role_id=learner.target_role_id,
        target_role_title=role_title,
        readiness_percentage=readiness,
        total_planned_hours=round(total_planned, 1),
        total_logged_hours=round(total_logged, 1),
        overall_progress_percentage=overall_pct,
        current_week=current_week,
        total_weeks=total_weeks,
        stages_progress=stages_progress,
        next_three_actions=next_three
    )

