from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class TaskUpdateSchema(BaseModel):
    status: Optional[str] = None  # todo, in_progress, completed, skipped
    logged_hours: Optional[float] = None
    evidence_link: Optional[str] = None

class TaskDetailSchema(BaseModel):
    id: str
    roadmap_id: str
    stage: int
    week_number: int
    task_order: int
    title: str
    description: Optional[str]
    linked_req_ids: List[str]
    numeric_why: str
    resource_title: Optional[str]
    resource_url: Optional[str]
    est_hours: float
    logged_hours: float
    success_criterion: Optional[str]
    evidence_artifact: Optional[str]
    evidence_link: Optional[str]
    status: str
    completed_at: Optional[datetime]

class StageGroupSchema(BaseModel):
    stage: int
    stage_name: str
    total_hours: float
    completed_hours: float
    tasks_count: int
    completed_count: int
    tasks: List[TaskDetailSchema]

class RoadmapResponse(BaseModel):
    id: str
    learner_id: str
    role_id: str
    role_title: str
    version: int
    is_active: bool
    total_planned_hours: float
    total_logged_hours: float
    total_weeks: int
    completion_percentage: float
    stages: List[StageGroupSchema]
    tasks: List[TaskDetailSchema]

