from typing import List, Optional
from pydantic import BaseModel

class RequirementGapDetail(BaseModel):
    req_id: str
    skill: str
    category: str
    required_level: int
    current_level: int
    gap: int
    priority: float
    status: str  # Strength, Minor gap, Major gap, Missing
    importance: str
    weight: float
    is_foundational: bool
    evidence_types: List[str]
    description: str
    proof_url: Optional[str] = None
    verification_status: str  # verified or unverified

class GapAnalysisResponse(BaseModel):
    role_id: str
    role_title: str
    readiness_percentage: float
    total_requirements: int
    strengths_count: int
    minor_gaps_count: int
    major_gaps_count: int
    missing_count: int
    requirements: List[RequirementGapDetail]

