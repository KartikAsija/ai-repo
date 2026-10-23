from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from backend.app.schemas.learner import SkillInput
from backend.app.schemas.roadmap import RoadmapResponse

class ReplanRequest(BaseModel):
    new_available_hours_per_week: Optional[float] = Field(None, ge=1.0, le=80.0)
    new_target_role_id: Optional[str] = None
    new_target_completion_date: Optional[str] = None
    updated_skills: Optional[List[SkillInput]] = None
    reason: Optional[str] = "Learner updated schedule or target role"

class ReplanDiffItem(BaseModel):
    type: str  # rescheduled, added, removed
    title: str
    old_week: Optional[int] = None
    new_week: Optional[int] = None
    reason: str

class ReplanDiffReport(BaseModel):
    reason: str
    summary: str
    tasks_retained: int
    tasks_rescheduled: int
    tasks_added: int
    tasks_removed: int
    weeks_delta: int
    old_total_weeks: int
    new_total_weeks: int
    old_hours_per_week: float
    new_hours_per_week: float
    details: List[ReplanDiffItem]

class ReplanResponse(BaseModel):
    roadmap: RoadmapResponse
    diff: ReplanDiffReport

