from typing import Dict, List, Any, Optional

IMPORTANCE_WEIGHTS = {
    "Critical": 3.0,
    "High": 2.0,
    "Medium": 1.0,
    "Nice-to-have": 0.5
}

def calculate_gap(required_level: int, current_level: int) -> int:
    return max(0, required_level - current_level)

def determine_gap_status(required_level: int, current_level: int) -> str:
    gap = calculate_gap(required_level, current_level)
    if gap == 0:
        return "Strength"
    if current_level == 0:
        return "Missing"
    if gap == 1:
        return "Minor gap"
    return "Major gap"

def calculate_priority(
    gap: int,
    importance: str,
    is_foundational: bool = False,
    skill_name: str = "",
    category: str = "",
    learner_interests: Optional[List[str]] = None
) -> float:
    if gap == 0:
        return 0.0

    weight = IMPORTANCE_WEIGHTS.get(importance, 1.0)
    prereq_factor = 1.3 if (is_foundational and gap > 0) else 1.0
    
    # Check interest bonus
    interest_bonus = 1.0
    if learner_interests:
        interests_lower = [i.strip().lower() for i in learner_interests if i.strip()]
        skill_lower = skill_name.lower()
        cat_lower = category.lower()
        for interest in interests_lower:
            if interest in skill_lower or interest in cat_lower or skill_lower in interest:
                interest_bonus = 1.15
                break

    raw_priority = gap * weight * prereq_factor * interest_bonus
    return round(raw_priority, 2)

def calculate_readiness_percentage(
    requirements: List[Dict[str, Any]],
    user_skills_map: Dict[str, Dict[str, Any]]
) -> float:
    """
    Readiness = sum(min(current_level, required_level) * weight) / sum(required_level * weight) * 100%
    """
    total_required_weighted = 0.0
    total_acquired_weighted = 0.0

    for req in requirements:
        skill_name = req["skill"]
        req_level = req["required_level"]
        weight = float(req.get("weight", 1.0))

        user_skill = user_skills_map.get(skill_name, {})
        current_level = int(user_skill.get("current_level", 0))

        total_required_weighted += req_level * weight
        total_acquired_weighted += min(current_level, req_level) * weight

    if total_required_weighted == 0:
        return 100.0

    readiness = (total_acquired_weighted / total_required_weighted) * 100.0
    return round(readiness, 1)

def analyze_learner_gaps(
    role_data: Dict[str, Any],
    learner_skills_list: List[Dict[str, Any]],
    learner_interests: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Performs comprehensive gap analysis comparing learner's skills to a role framework.
    """
    # Build fast lookup map by skill name (case-insensitive key)
    skills_map: Dict[str, Dict[str, Any]] = {}
    for s in learner_skills_list:
        skills_map[s["skill_name"].strip().lower()] = s

    requirements = role_data.get("requirements", [])
    gap_results = []
    
    strengths_count = 0
    minor_gaps_count = 0
    major_gaps_count = 0
    missing_count = 0

    for req in requirements:
        skill_name = req["skill"]
        key = skill_name.strip().lower()
        user_skill = skills_map.get(key, {})
        
        current_level = int(user_skill.get("current_level", 0))
        required_level = int(req["required_level"])
        proof_url = user_skill.get("proof_url", "")
        verification_status = "verified" if (proof_url and proof_url.strip().startswith("http")) else "unverified"
        
        gap = calculate_gap(required_level, current_level)
        status = determine_gap_status(required_level, current_level)
        priority = calculate_priority(
            gap=gap,
            importance=req.get("importance", "Medium"),
            is_foundational=req.get("is_foundational", False),
            skill_name=skill_name,
            category=req.get("category", ""),
            learner_interests=learner_interests
        )

        if status == "Strength":
            strengths_count += 1
        elif status == "Minor gap":
            minor_gaps_count += 1
        elif status == "Major gap":
            major_gaps_count += 1
        elif status == "Missing":
            missing_count += 1

        gap_results.append({
            "req_id": req["req_id"],
            "skill": skill_name,
            "category": req.get("category", "General"),
            "required_level": required_level,
            "current_level": current_level,
            "gap": gap,
            "priority": priority,
            "status": status,
            "importance": req.get("importance", "Medium"),
            "weight": req.get("weight", 1.0),
            "is_foundational": req.get("is_foundational", False),
            "evidence_types": req.get("evidence_types", []),
            "description": req.get("description", ""),
            "proof_url": proof_url,
            "verification_status": verification_status
        })

    # Sort gaps primarily by priority (descending), then by gap (descending)
    gap_results.sort(key=lambda x: (x["priority"], x["gap"]), reverse=True)

    readiness = calculate_readiness_percentage(
        requirements=requirements,
        user_skills_map={s["skill_name"]: s for s in learner_skills_list}
    )

    return {
        "role_id": role_data.get("role_id"),
        "role_title": role_data.get("title"),
        "readiness_percentage": readiness,
        "total_requirements": len(requirements),
        "strengths_count": strengths_count,
        "minor_gaps_count": minor_gaps_count,
        "major_gaps_count": major_gaps_count,
        "missing_count": missing_count,
        "requirements": gap_results
    }

