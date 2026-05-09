"""JWT认证模块"""
import jwt
import hashlib
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "smart-library-2026-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer(auto_error=False)

# 模拟用户数据库（生产环境应接真实SSO/LDAP）
USERS = {
    "student1": {"password": hashlib.sha256("123456".encode()).hexdigest(), "role": "student", "student_id": "S2022001"},
    "student2": {"password": hashlib.sha256("123456".encode()).hexdigest(), "role": "student", "student_id": "S2022002"},
    "teacher1": {"password": hashlib.sha256("123456".encode()).hexdigest(), "role": "teacher", "dept": "计算机科学与技术"},
    "admin":    {"password": hashlib.sha256("admin123".encode()).hexdigest(), "role": "admin", "dept": ""},
}


def create_token(username: str, role: str, student_id: str = "", dept: str = "") -> str:
    payload = {
        "sub": username,
        "role": role,
        "student_id": student_id,
        "dept": dept,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="请提供认证令牌")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="令牌已过期，请重新登录")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效令牌")


def require_role(role: str):
    """依赖注入：要求特定角色"""
    def checker(payload: dict = Depends(verify_token)):
        if payload["role"] != role and payload["role"] != "admin":
            raise HTTPException(status_code=403, detail=f"需要{role}权限")
        return payload
    return checker


def get_student_id(payload: dict = Depends(verify_token)) -> str:
    """从token中提取学生ID，学生只能查自己"""
    return payload.get("student_id", "")


def mask_student_id(student_id: str) -> str:
    """学号脱敏：S2022001 → S****2001"""
    if len(student_id) >= 5:
        return student_id[0] + "****" + student_id[-4:]
    return student_id
