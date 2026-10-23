from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.role import RoleSummarySchema, RoleDetailSchema
from backend.app.services.role_service import get_all_roles, get_role_by_id

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("", response_model=List[RoleSummarySchema])
def list_roles():
    return get_all_roles()

@router.get("/{role_id}", response_model=RoleDetailSchema)
def get_role(role_id: str):
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{role_id}' not found.")
    return role

