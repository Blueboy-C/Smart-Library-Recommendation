"""认证路由"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..auth import USERS, create_token, verify_token, hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    user = USERS.get(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    if user["password"] != pwd_hash:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_token(
        req.username,
        user["role"],
        user.get("student_id", ""),
        user.get("dept", ""),
    )
    return {
        "access_token": token,
        "role": user["role"],
        "username": req.username,
        "student_id": user.get("student_id", ""),
        "dept": user.get("dept", ""),
    }


@router.get("/me")
def me(payload: dict = Depends(verify_token)):
    return payload
