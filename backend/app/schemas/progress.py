from typing import List, Optional
from pydantic import BaseModel
from backend.app.schemas.roadmap import TaskDetailSchema

class StageProgress(BaseModel):
    stage: int
    stage_name: str
    completed_tasks: int
    total_tasks: int
    completion_percentage: float

class ProgressResponse(BaseModel):
    learner_id: str
    alias: str
    target_role_id: str
    target_role_title: str
    readiness_percentage: float
    total_planned_hours: float
    total_logged_hours: float
    overall_progress_percentage: float
    current_week: int
    total_weeks: int
    stages_progress: List[StageProgress]
    next_three_actions: List[TaskDetailSchema]

