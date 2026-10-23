import pytest
from backend.app.services.roadmap_service import (
    schedule_tasks_into_weeks,
    chunk_task_hours
)

def test_chunk_task_hours():
    # 16 hours into max 6 hours -> [6.0, 6.0, 4.0]
    chunks = chunk_task_hours(16.0, 6.0)
    assert chunks == [6.0, 6.0, 4.0]
    assert sum(chunks) == 16.0

    # 4 hours into max 6 hours -> [4.0]
    assert chunk_task_hours(4.0, 6.0) == [4.0]

def test_weekly_hours_packing_invariant():
    tasks = [
        {"title": "Task 1", "est_hours": 3.0, "stage": 1},
        {"title": "Task 2", "est_hours": 3.0, "stage": 1},
        {"title": "Task 3", "est_hours": 4.0, "stage": 2},
        {"title": "Task 4 (Large Project)", "est_hours": 10.0, "stage": 3},
        {"title": "Task 5", "est_hours": 2.0, "stage": 4}
    ]

    available_hours = 6.0
    scheduled = schedule_tasks_into_weeks(tasks, available_hours)

    # Group by week and verify invariant
    weeks = {}
    for t in scheduled:
        w = t["week_number"]
        weeks[w] = weeks.get(w, 0.0) + t["est_hours"]

    for w, total_hrs in weeks.items():
        assert total_hrs <= available_hours, f"Week {w} has {total_hrs} hours, exceeding {available_hours}"

def test_stage_progression_order():
    tasks = [
        {"title": "S1 Task", "est_hours": 2.0, "stage": 1},
        {"title": "S2 Task", "est_hours": 2.0, "stage": 2},
        {"title": "S3 Task", "est_hours": 2.0, "stage": 3},
        {"title": "S4 Task", "est_hours": 2.0, "stage": 4}
    ]
    scheduled = schedule_tasks_into_weeks(tasks, 10.0)
    stages = [t["stage"] for t in scheduled]
    assert stages == [1, 2, 3, 4]

