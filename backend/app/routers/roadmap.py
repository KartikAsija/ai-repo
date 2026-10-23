import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Learner, Roadmap, RoadmapTask
from backend.app.schemas.roadmap import (
    RoadmapResponse,
    StageGroupSchema,
    TaskDetailSchema,
    TaskUpdateSchema
)
from backend.app.services.role_service import get_role_by_id
from backend.app.services.roadmap_service import generate_roadmap, STAGE_NAMES

router = APIRouter(tags=["Roadmap"])

def serialize_task_model(task: RoadmapTask) -> TaskDetailSchema:
    try:
        req_ids = json.loads(task.linked_req_ids) if task.linked_req_ids else []
    except Exception:
        req_ids = []

    return TaskDetailSchema(
        id=task.id,
        roadmap_id=task.roadmap_id,
        stage=task.stage,
        week_number=task.week_number,
        task_order=task.task_order,
        title=task.title,
        description=task.description,
        linked_req_ids=req_ids,
        numeric_why=task.numeric_why,
        resource_title=task.resource_title,
        resource_url=task.resource_url,
        est_hours=task.est_hours,
        logged_hours=task.logged_hours or 0.0,
        success_criterion=task.success_criterion,
        evidence_artifact=task.evidence_artifact,
        evidence_link=task.evidence_link,
        status=task.status,
        completed_at=task.completed_at
    )

def build_roadmap_response(roadmap: Roadmap) -> RoadmapResponse:
    role = get_role_by_id(roadmap.role_id)
    role_title = role.get("title", roadmap.role_id) if role else roadmap.role_id

    # Group tasks by stage
    stages_map: Dict[int, List[TaskDetailSchema]] = {1: [], 2: [], 3: [], 4: []}
    all_tasks_serialized = []
    total_logged = 0.0

    for task in roadmap.tasks:
        serialized = serialize_task_model(task)
        stages_map.setdefault(task.stage, []).append(serialized)
        all_tasks_serialized.append(serialized)
        total_logged += (task.logged_hours or 0.0)

    stages_list = []
    completed_task_count = sum(1 for t in all_tasks_serialized if t.status == "completed")
    total_task_count = len(all_tasks_serialized)

    for stg_num in [1, 2, 3, 4]:
        tasks_in_stg = stages_map.get(stg_num, [])
        stg_hrs = sum(t.est_hours for t in tasks_in_stg)
        stg_completed_hrs = sum(t.logged_hours for t in tasks_in_stg if t.status == "completed")
        stg_comp_count = sum(1 for t in tasks_in_stg if t.status == "completed")

        stages_list.append(StageGroupSchema(
            stage=stg_num,
            stage_name=STAGE_NAMES.get(stg_num, f"Stage {stg_num}"),
            total_hours=round(stg_hrs, 1),
            completed_hours=round(stg_completed_hrs, 1),
            tasks_count=len(tasks_in_stg),
            completed_count=stg_comp_count,
            tasks=tasks_in_stg
        ))

    completion_pct = round((completed_task_count / total_task_count * 100.0), 1) if total_task_count > 0 else 0.0

    return RoadmapResponse(
        id=roadmap.id,
        learner_id=roadmap.learner_id,
        role_id=roadmap.role_id,
        role_title=role_title,
        version=roadmap.version,
        is_active=roadmap.is_active,
        total_planned_hours=roadmap.total_planned_hours,
        total_logged_hours=round(total_logged, 1),
        total_weeks=roadmap.total_weeks,
        completion_percentage=completion_pct,
        stages=stages_list,
        tasks=all_tasks_serialized
    )

@router.post("/learners/{learner_id}/roadmap", response_model=RoadmapResponse)
def create_or_regenerate_roadmap(learner_id: str, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    role = get_role_by_id(learner.target_role_id)
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{learner.target_role_id}' not found")

    skills_list = [
        {"skill_name": s.skill_name, "current_level": s.current_level, "proof_url": s.proof_url}
        for s in learner.skills
    ]
    try:
        interests = json.loads(learner.interests) if learner.interests else []
    except Exception:
        interests = []

    profile_dict = {
        "alias": learner.alias,
        "target_role_id": learner.target_role_id,
        "interests": interests
    }

    generated = generate_roadmap(role, profile_dict, skills_list, learner.available_hours_per_week)

    # Deactivate any previous roadmaps
    db.query(Roadmap).filter(Roadmap.learner_id == learner_id).update({"is_active": False})

    # Create new Roadmap record
    new_roadmap = Roadmap(
        learner_id=learner_id,
        role_id=learner.target_role_id,
        version=1,
        is_active=True,
        total_planned_hours=generated["total_planned_hours"],
        total_weeks=generated["total_weeks"]
    )
    db.add(new_roadmap)
    db.flush()

    for idx, t in enumerate(generated["tasks"]):
        db_task = RoadmapTask(
            roadmap_id=new_roadmap.id,
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
        db.add(db_task)

    db.commit()
    db.refresh(new_roadmap)
    return build_roadmap_response(new_roadmap)

@router.get("/learners/{learner_id}/roadmap", response_model=RoadmapResponse)
def get_learner_roadmap(learner_id: str, db: Session = Depends(get_db)):
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.learner_id == learner_id, Roadmap.is_active == True)
        .order_by(Roadmap.version.desc())
        .first()
    )
    if not roadmap:
        # Generate one on the fly if none exists
        return create_or_regenerate_roadmap(learner_id, db)
    return build_roadmap_response(roadmap)

@router.patch("/tasks/{task_id}", response_model=TaskDetailSchema)
def update_task(task_id: str, payload: TaskUpdateSchema, db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.status is not None:
        valid_statuses = ["todo", "in_progress", "completed", "skipped"]
        if payload.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        task.status = payload.status
        if payload.status == "completed" and not task.completed_at:
            task.completed_at = datetime.utcnow()
            # If logged hours not supplied, default to est_hours
            if payload.logged_hours is None and task.logged_hours == 0:
                task.logged_hours = task.est_hours

    if payload.logged_hours is not None:
        task.logged_hours = payload.logged_hours

    if payload.evidence_link is not None:
        task.evidence_link = payload.evidence_link

    db.commit()
    db.refresh(task)
    return serialize_task_model(task)

