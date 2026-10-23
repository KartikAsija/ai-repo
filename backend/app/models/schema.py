import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Learner(Base):
    __tablename__ = "learners"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alias = Column(String(100), nullable=False)
    current_role = Column(String(100), nullable=True)
    education = Column(String(100), nullable=True)
    target_role_id = Column(String(50), nullable=False)
    preferred_learning_style = Column(String(50), default="Hands-on Projects")
    available_hours_per_week = Column(Float, default=10.0, nullable=False)
    target_completion_date = Column(String(20), nullable=True)
    interests = Column(Text, default="[]")  # JSON encoded list of strings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships with cascade deletion
    skills = relationship("LearnerSkill", back_populates="learner", cascade="all, delete-orphan")
    experiences = relationship("LearnerExperience", back_populates="learner", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="learner", cascade="all, delete-orphan")

class LearnerSkill(Base):
    __tablename__ = "learner_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    learner_id = Column(String(36), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    current_level = Column(Integer, nullable=False, default=1)  # 1-5
    proof_url = Column(String(500), nullable=True)
    verification_status = Column(String(20), default="unverified")  # "verified" or "unverified"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    learner = relationship("Learner", back_populates="skills")

class LearnerExperience(Base):
    __tablename__ = "learner_experiences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    learner_id = Column(String(36), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    organization = Column(String(150), nullable=True)
    duration = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    learner = relationship("Learner", back_populates="experiences")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    learner_id = Column(String(36), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(String(50), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    total_planned_hours = Column(Float, default=0.0)
    total_weeks = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    learner = relationship("Learner", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")
    replan_logs = relationship("ReplanLog", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(Integer, nullable=False)  # 1: Foundations, 2: Core, 3: Applied, 4: Employability
    week_number = Column(Integer, nullable=False)
    task_order = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    linked_req_ids = Column(Text, nullable=False, default="[]")  # JSON string e.g. '["DA-REQ-02"]'
    numeric_why = Column(Text, nullable=False)
    resource_title = Column(String(255), nullable=True)
    resource_url = Column(String(500), nullable=True)
    est_hours = Column(Float, nullable=False, default=1.0)
    logged_hours = Column(Float, default=0.0)
    success_criterion = Column(Text, nullable=True)
    evidence_artifact = Column(Text, nullable=True)
    evidence_link = Column(String(500), nullable=True)
    status = Column(String(20), default="todo")  # todo, in_progress, completed, skipped
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="tasks")

class ReplanLog(Base):
    __tablename__ = "replan_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    tasks_retained = Column(Integer, default=0)
    tasks_rescheduled = Column(Integer, default=0)
    tasks_added = Column(Integer, default=0)
    tasks_removed = Column(Integer, default=0)
    weeks_delta = Column(Integer, default=0)
    diff_json = Column(Text, default="{}")  # JSON serialized details of changes
    created_at = Column(DateTime, default=datetime.utcnow)

    roadmap = relationship("Roadmap", back_populates="replan_logs")

