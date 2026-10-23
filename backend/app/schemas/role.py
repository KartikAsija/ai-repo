from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class RoleSummarySchema(BaseModel):
    role_id: str
    title: str
    source: str
    last_reviewed: str
    description: Optional[str] = None
    requirements_count: int
    resources_count: int
    projects_count: int

class RequirementItem(BaseModel):
    req_id: str
    skill: str
    category: str
    required_level: int
    importance: str
    weight: float
    is_foundational: Optional[bool] = False
    evidence_types: List[str]
    description: str

class LearningResourceItem(BaseModel):
    resource_id: str
    title: str
    url: str
    est_hours: float
    covers_req_ids: List[str]
    level_from: int
    level_to: int
    cost: str

class ProjectTemplateItem(BaseModel):
    project_id: str
    title: str
    brief: str
    est_hours: float
    skills_demonstrated: List[str]
    deliverables: List[str]
    evidence_output: str

class RoleDetailSchema(BaseModel):
    role_id: str
    title: str
    source: str
    last_reviewed: str
    description: str
    rubric: Dict[str, str]
    requirements: List[RequirementItem]
    learning_resources: List[LearningResourceItem]
    project_templates: List[ProjectTemplateItem]

