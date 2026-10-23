import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Learner
from backend.app.schemas.analysis import GapAnalysisResponse
from backend.app.services.role_service import get_role_by_id
from backend.app.services.scoring_service import analyze_learner_gaps

router = APIRouter(prefix="/learners", tags=["Analysis"])

@router.post("/{learner_id}/analysis", response_model=GapAnalysisResponse)
def compute_learner_analysis(learner_id: str, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    role = get_role_by_id(learner.target_role_id)
    if not role:
        raise HTTPException(status_code=400, detail=f"Target role '{learner.target_role_id}' not found.")

    try:
        interests = json.loads(learner.interests) if learner.interests else []
    except Exception:
        interests = []

    skills_list = [
        {
            "skill_name": s.skill_name,
            "current_level": s.current_level,
            "proof_url": s.proof_url
        }
        for s in learner.skills
    ]

    result = analyze_learner_gaps(
        role_data=role,
        learner_skills_list=skills_list,
        learner_interests=interests
    )

    return result

