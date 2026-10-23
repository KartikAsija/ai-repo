import os
import json
import glob
from typing import Dict, List, Optional, Any

# Resolve the data/roles path relative to project root or current working dir
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR) if os.path.basename(BASE_DIR) == "backend" else BASE_DIR

# Check candidates for data/roles directory
CANDIDATE_PATHS = [
    os.path.join(PROJECT_ROOT, "data", "roles"),
    os.path.join(BASE_DIR, "data", "roles"),
    os.path.join(os.getcwd(), "data", "roles"),
    "data/roles"
]

ROLES_CACHE: Dict[str, Any] = {}

def get_roles_dir() -> str:
    for path in CANDIDATE_PATHS:
        if os.path.isdir(path):
            return path
    # Default fallback
    return os.path.join(PROJECT_ROOT, "data", "roles")

def load_roles(force_reload: bool = False) -> Dict[str, Any]:
    global ROLES_CACHE
    if ROLES_CACHE and not force_reload:
        return ROLES_CACHE

    roles_dir = get_roles_dir()
    roles = {}
    pattern = os.path.join(roles_dir, "*.json")
    for file_path in glob.glob(pattern):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                role_data = json.load(f)
                role_id = role_data.get("role_id")
                if role_id:
                    roles[role_id] = role_data
        except Exception as e:
            print(f"Error loading role file {file_path}: {e}")

    ROLES_CACHE = roles
    return ROLES_CACHE

def get_all_roles() -> List[Dict[str, Any]]:
    roles = load_roles()
    summaries = []
    for r_id, r in roles.items():
        summaries.append({
            "role_id": r.get("role_id"),
            "title": r.get("title"),
            "source": r.get("source"),
            "last_reviewed": r.get("last_reviewed"),
            "description": r.get("description"),
            "requirements_count": len(r.get("requirements", [])),
            "resources_count": len(r.get("learning_resources", [])),
            "projects_count": len(r.get("project_templates", []))
        })
    return summaries

def get_role_by_id(role_id: str) -> Optional[Dict[str, Any]]:
    roles = load_roles()
    return roles.get(role_id)

def get_requirement(role_id: str, req_id: str) -> Optional[Dict[str, Any]]:
    role = get_role_by_id(role_id)
    if not role:
        return None
    for req in role.get("requirements", []):
        if req.get("req_id") == req_id:
            return req
    return None

def validate_requirement_ids(role_id: str, req_ids: List[str]) -> bool:
    role = get_role_by_id(role_id)
    if not role:
        return False
    valid_ids = {req["req_id"] for req in role.get("requirements", [])}
    return all(r_id in valid_ids for r_id in req_ids)

