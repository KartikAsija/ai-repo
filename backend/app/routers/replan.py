import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Learner, LearnerSkill, Roadmap, RoadmapTask, ReplanLog
from backend.app.schemas.replan import ReplanRequest, ReplanResponse, ReplanDiffReport, ReplanDiffItem
from backend.app.services.role_service import get_role_by_id
from backend.app.services.replan_service import compute_replan
from backend.app.routers.roadmap import build_roadmap_response

router = APIRouter(prefix="/learners", tags=["Replan"])

@router.post("/{learner_id}/replan", response_model=ReplanResponse)
def replan_learner_roadmap(learner_id: str, payload: ReplanRequest, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    old_hours = learner.available_hours_per_week
    new_hours = payload.new_available_hours_per_week if payload.new_available_hours_per_week is not None else old_hours

    old_role_id = learner.target_role_id
    new_role_id = payload.new_target_role_id if payload.new_target_role_id is not None else old_role_id

    current_role_data = get_role_by_id(old_role_id)
    new_role_data = get_role_by_id(new_role_id)
    if not new_role_data:
        raise HTTPException(status_code=400, detail=f"Target role '{new_role_id}' not found")

    # Update skills if provided in payload
    if payload.updated_skills:
        db.query(LearnerSkill).filter(LearnerSkill.learner_id == learner_id).delete()
        for s in payload.updated_skills:
            status_v = "verified" if (s.proof_url and s.proof_url.strip().startswith("http")) else "unverified"
            db.add(LearnerSkill(
                learner_id=learner_id,
                skill_name=s.skill_name,
                current_level=s.current_level,
                proof_url=s.proof_url,
                verification_status=status_v
            ))
        db.flush()

    # Update learner model fields
    learner.available_hours_per_week = new_hours
    learner.target_role_id = new_role_id
    if payload.new_target_completion_date:
        learner.target_completion_date = payload.new_target_completion_date

    # Retrieve current active roadmap and existing tasks
    active_roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.learner_id == learner_id, Roadmap.is_active == True)
        .order_by(Roadmap.version.desc())
        .first()
    )

    existing_tasks = []
    if active_roadmap:
        for t in active_roadmap.tasks:
            try:
                r_ids = json.loads(t.linked_req_ids) if t.linked_req_ids else []
            except Exception:
                r_ids = []
            existing_tasks.append({
                "id": t.id,
                "stage": t.stage,
                "week_number": t.week_number,
                "task_order": t.task_order,
                "title": t.title,
                "description": t.description,
                "linked_req_ids": r_ids,
                "numeric_why": t.numeric_why,
                "resource_title": t.resource_title,
                "resource_url": t.resource_url,
                "est_hours": t.est_hours,
                "logged_hours": t.logged_hours or 0.0,
                "success_criterion": t.success_criterion,
                "evidence_artifact": t.evidence_artifact,
                "evidence_link": t.evidence_link,
                "status": t.status,
                "completed_at": t.completed_at
            })

    current_skills_list = [
        {"skill_name": s.skill_name, "current_level": s.current_level, "proof_url": s.proof_url}
        for s in learner.skills
    ]
    try:
        interests = json.loads(learner.interests) if learner.interests else []
    except Exception:
        interests = []

    profile_dict = {
        "alias": learner.alias,
        "target_role_id": new_role_id,
        "interests": interests
    }

    replan_result = compute_replan(
        existing_tasks=existing_tasks,
        current_role_data=current_role_data,
        new_role_data=new_role_data,
        learner_profile=profile_dict,
        current_skills=current_skills_list,
        new_hours_per_week=new_hours,
        old_hours_per_week=old_hours,
        reason=payload.reason or "Learner initiated schedule/role replan"
    )

    new_version = (active_roadmap.version + 1) if active_roadmap else 1
    if active_roadmap:
        active_roadmap.is_active = False

    # Create new Roadmap record
    new_roadmap = Roadmap(
        learner_id=learner_id,
        role_id=new_role_id,
        version=new_version,
        is_active=True,
        total_planned_hours=replan_result["total_planned_hours"],
        total_weeks=replan_result["total_weeks"]
    )
    db.add(new_roadmap)
    db.flush()

    for idx, t in enumerate(replan_result["tasks"]):
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
            logged_hours=t.get("logged_hours", 0.0),
            success_criterion=t.get("success_criterion"),
            evidence_artifact=t.get("evidence_artifact"),
            evidence_link=t.get("evidence_link"),
            status=t.get("status", "todo"),
            completed_at=t.get("completed_at")
        )
        db.add(db_task)

    diff_data = replan_result["diff"]
    replan_log = ReplanLog(
        roadmap_id=new_roadmap.id,
        reason=diff_data["reason"],
        tasks_retained=diff_data["tasks_retained"],
        tasks_rescheduled=diff_data["tasks_rescheduled"],
        tasks_added=diff_data["tasks_added"],
        tasks_removed=diff_data["tasks_removed"],
        weeks_delta=diff_data["weeks_delta"],
        diff_json=json.dumps(diff_data)
    )
    db.add(replan_log)

    db.commit()
    db.refresh(new_roadmap)

    diff_report = ReplanDiffReport(
        reason=diff_data["reason"],
        summary=diff_data["summary"],
        tasks_retained=diff_data["tasks_retained"],
        tasks_rescheduled=diff_data["tasks_rescheduled"],
        tasks_added=diff_data["tasks_added"],
        tasks_removed=diff_data["tasks_removed"],
        weeks_delta=diff_data["weeks_delta"],
        old_total_weeks=diff_data["old_total_weeks"],
        new_total_weeks=diff_data["new_total_weeks"],
        old_hours_per_week=diff_data["old_hours_per_week"],
        new_hours_per_week=diff_data["new_hours_per_week"],
        details=[
            ReplanDiffItem(
                type=d["type"],
                title=d["title"],
                old_week=d.get("old_week"),
                new_week=d.get("new_week"),
                reason=d["reason"]
            )
            for d in diff_data["details"]
        ]
    )

    return ReplanResponse(
        roadmap=build_roadmap_response(new_roadmap),
        diff=diff_report
    )

