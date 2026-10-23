from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class SkillInput(BaseModel):
    skill_name: str = Field(..., min_length=1)
    current_level: int = Field(..., ge=0, le=5)
    proof_url: Optional[str] = None

class SkillDetail(SkillInput):
    id: Optional[int] = None
    verification_status: str = "unverified"

class ExperienceInput(BaseModel):
    title: str = Field(..., min_length=1)
    organization: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ExperienceDetail(ExperienceInput):
    id: Optional[int] = None

class LearnerCreateSchema(BaseModel):
    alias: str = Field(..., min_length=2, max_length=100)
    current_role: Optional[str] = "Independent Learner"
    education: Optional[str] = None
    target_role_id: str = Field(..., min_length=2)
    preferred_learning_style: Optional[str] = "Hands-on Projects"
    available_hours_per_week: float = Field(10.0, ge=1.0, le=80.0)
    target_completion_date: Optional[str] = None
    interests: Optional[List[str]] = []
    skills: Optional[List[SkillInput]] = []
    experiences: Optional[List[ExperienceInput]] = []

class LearnerUpdateSchema(BaseModel):
    alias: Optional[str] = None
    current_role: Optional[str] = None
    education: Optional[str] = None
    target_role_id: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    available_hours_per_week: Optional[float] = Field(None, ge=1.0, le=80.0)
    target_completion_date: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[SkillInput]] = None

class LearnerSummarySchema(BaseModel):
    id: str
    alias: str
    current_role: Optional[str]
    target_role_id: str
    target_role_title: Optional[str] = None
    available_hours_per_week: float
    readiness_percentage: Optional[float] = 0.0
    created_at: datetime

class LearnerDetailSchema(BaseModel):
    id: str
    alias: str
    current_role: Optional[str]
    education: Optional[str]
    target_role_id: str
    target_role_title: Optional[str] = None
    preferred_learning_style: str
    available_hours_per_week: float
    target_completion_date: Optional[str]
    interests: List[str]
    created_at: datetime
    skills: List[SkillDetail]
    experiences: List[ExperienceDetail]

