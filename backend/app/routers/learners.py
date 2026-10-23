import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.schema import Learner, LearnerSkill, LearnerExperience, Roadmap
from backend.app.schemas.learner import (
    LearnerCreateSchema,
    LearnerUpdateSchema,
    LearnerDetailSchema,
    LearnerSummarySchema,
    SkillDetail,
    ExperienceDetail
)
from backend.app.services.role_service import get_role_by_id
from backend.app.services.scoring_service import calculate_readiness_percentage

router = APIRouter(prefix="/learners", tags=["Learners"])

def build_learner_detail(learner: Learner) -> LearnerDetailSchema:
    role = get_role_by_id(learner.target_role_id)
    role_title = role.get("title", learner.target_role_id) if role else learner.target_role_id

    try:
        interests_list = json.loads(learner.interests) if learner.interests else []
    except Exception:
        interests_list = []

    skills_out = [
        SkillDetail(
            id=s.id,
            skill_name=s.skill_name,
            current_level=s.current_level,
            proof_url=s.proof_url,
            verification_status=s.verification_status
        )
        for s in learner.skills
    ]

    exp_out = [
        ExperienceDetail(
            id=e.id,
            title=e.title,
            organization=e.organization,
            duration=e.duration,
            description=e.description
        )
        for e in learner.experiences
    ]

    return LearnerDetailSchema(
        id=learner.id,
        alias=learner.alias,
        current_role=learner.current_role,
        education=learner.education,
        target_role_id=learner.target_role_id,
        target_role_title=role_title,
        preferred_learning_style=learner.preferred_learning_style,
        available_hours_per_week=learner.available_hours_per_week,
        target_completion_date=learner.target_completion_date,
        interests=interests_list,
        created_at=learner.created_at,
        skills=skills_out,
        experiences=exp_out
    )

@router.post("", response_model=LearnerDetailSchema, status_code=status.HTTP_201_CREATED)
def create_learner(payload: LearnerCreateSchema, db: Session = Depends(get_db)):
    role = get_role_by_id(payload.target_role_id)
    if not role:
        raise HTTPException(status_code=400, detail=f"Target role '{payload.target_role_id}' does not exist.")

    learner = Learner(
        alias=payload.alias,
        current_role=payload.current_role,
        education=payload.education,
        target_role_id=payload.target_role_id,
        preferred_learning_style=payload.preferred_learning_style,
        available_hours_per_week=payload.available_hours_per_week,
        target_completion_date=payload.target_completion_date,
        interests=json.dumps(payload.interests or [])
    )
    db.add(learner)
    db.flush()

    if payload.skills:
        for s in payload.skills:
            status_v = "verified" if (s.proof_url and s.proof_url.strip().startswith("http")) else "unverified"
            db.add(LearnerSkill(
                learner_id=learner.id,
                skill_name=s.skill_name,
                current_level=s.current_level,
                proof_url=s.proof_url,
                verification_status=status_v
            ))

    if payload.experiences:
        for e in payload.experiences:
            db.add(LearnerExperience(
                learner_id=learner.id,
                title=e.title,
                organization=e.organization,
                duration=e.duration,
                description=e.description
            ))

    db.commit()
    db.refresh(learner)
    return build_learner_detail(learner)

@router.get("", response_model=List[LearnerSummarySchema])
def list_learners(db: Session = Depends(get_db)):
    learners = db.query(Learner).order_by(Learner.created_at.desc()).all()
    summaries = []
    for l in learners:
        role = get_role_by_id(l.target_role_id)
        role_title = role.get("title", l.target_role_id) if role else l.target_role_id
        
        # Calculate current readiness
        readiness = 0.0
        if role:
            user_skills_map = {s.skill_name: {"current_level": s.current_level} for s in l.skills}
            readiness = calculate_readiness_percentage(role.get("requirements", []), user_skills_map)

        summaries.append(LearnerSummarySchema(
            id=l.id,
            alias=l.alias,
            current_role=l.current_role,
            target_role_id=l.target_role_id,
            target_role_title=role_title,
            available_hours_per_week=l.available_hours_per_week,
            readiness_percentage=readiness,
            created_at=l.created_at
        ))
    return summaries

@router.get("/{learner_id}", response_model=LearnerDetailSchema)
def get_learner(learner_id: str, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")
    return build_learner_detail(learner)

@router.put("/{learner_id}", response_model=LearnerDetailSchema)
def update_learner(learner_id: str, payload: LearnerUpdateSchema, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    if payload.alias is not None:
        learner.alias = payload.alias
    if payload.current_role is not None:
        learner.current_role = payload.current_role
    if payload.education is not None:
        learner.education = payload.education
    if payload.target_role_id is not None:
        if not get_role_by_id(payload.target_role_id):
            raise HTTPException(status_code=400, detail="Target role does not exist")
        learner.target_role_id = payload.target_role_id
    if payload.preferred_learning_style is not None:
        learner.preferred_learning_style = payload.preferred_learning_style
    if payload.available_hours_per_week is not None:
        learner.available_hours_per_week = payload.available_hours_per_week
    if payload.target_completion_date is not None:
        learner.target_completion_date = payload.target_completion_date
    if payload.interests is not None:
        learner.interests = json.dumps(payload.interests)

    # If skills are updated, replace or update
    if payload.skills is not None:
        # Delete existing skills and replace
        db.query(LearnerSkill).filter(LearnerSkill.learner_id == learner_id).delete()
        for s in payload.skills:
            status_v = "verified" if (s.proof_url and s.proof_url.strip().startswith("http")) else "unverified"
            db.add(LearnerSkill(
                learner_id=learner_id,
                skill_name=s.skill_name,
                current_level=s.current_level,
                proof_url=s.proof_url,
                verification_status=status_v
            ))

    db.commit()
    db.refresh(learner)
    return build_learner_detail(learner)

@router.delete("/{learner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learner(learner_id: str, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    # Cascades handle skills, experiences, and roadmaps
    db.delete(learner)
    db.commit()
    return None

