import pytest
from backend.app.services.scoring_service import (
    calculate_gap,
    determine_gap_status,
    calculate_priority,
    calculate_readiness_percentage,
    analyze_learner_gaps
)

def test_gap_calculation():
    # If required is 3 and current is 1, gap is 2
    assert calculate_gap(required_level=3, current_level=1) == 2
    # If required is 3 and current is 3, gap is 0
    assert calculate_gap(required_level=3, current_level=3) == 0
    # If current exceeds required, gap is 0
    assert calculate_gap(required_level=3, current_level=5) == 0
    # If current is 0, gap equals required
    assert calculate_gap(required_level=4, current_level=0) == 4

def test_gap_status_labels():
    assert determine_gap_status(3, 4) == "Strength"
    assert determine_gap_status(3, 3) == "Strength"
    assert determine_gap_status(3, 2) == "Minor gap"
    assert determine_gap_status(4, 2) == "Major gap"
    assert determine_gap_status(3, 0) == "Missing"

def test_priority_formula():
    # Gap 0 should always have 0 priority
    assert calculate_priority(gap=0, importance="Critical") == 0.0

    # Gap 2, Critical (weight 3.0), not foundational -> 2 * 3.0 * 1.0 * 1.0 = 6.0
    assert calculate_priority(gap=2, importance="Critical", is_foundational=False) == 6.0

    # Gap 2, Critical (weight 3.0), is_foundational (1.3) -> 2 * 3.0 * 1.3 = 7.8
    assert calculate_priority(gap=2, importance="Critical", is_foundational=True) == 7.8

    # Gap 2, Critical (weight 3.0), foundational (1.3), matching interest (1.15) -> 2 * 3 * 1.3 * 1.15 = 8.97
    assert calculate_priority(
        gap=2,
        importance="Critical",
        is_foundational=True,
        skill_name="SQL Querying",
        category="Core Technical",
        learner_interests=["SQL", "Analytics"]
    ) == 8.97

def test_readiness_percentage():
    reqs = [
        {"skill": "SQL", "required_level": 3, "weight": 2.0},
        {"skill": "Python", "required_level": 3, "weight": 2.0}
    ]
    # Total required weighted = 3*2 + 3*2 = 12.0
    
    # 0 current skills -> 0.0%
    assert calculate_readiness_percentage(reqs, {}) == 0.0

    # SQL level 3 (3*2=6), Python level 0 (0) -> 6/12 = 50.0%
    skills = {"SQL": {"current_level": 3}, "Python": {"current_level": 0}}
    assert calculate_readiness_percentage(reqs, skills) == 50.0

    # SQL level 5 (capped at 3*2=6), Python level 3 (3*2=6) -> 12/12 = 100.0%
    skills_full = {"SQL": {"current_level": 5}, "Python": {"current_level": 3}}
    assert calculate_readiness_percentage(reqs, skills_full) == 100.0

