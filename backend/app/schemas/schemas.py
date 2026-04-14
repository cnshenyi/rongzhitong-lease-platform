"""
融智通 - Pydantic Schema定义
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


# ---- 认证 ----
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: dict


class LoginData(BaseModel):
    token: str
    expires_in: int
    user: "UserInfo"


# ---- 用户 ----
class UserInfo(BaseModel):
    id: UUID
    username: str
    real_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    real_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"
    department: Optional[str] = None


class UserUpdate(BaseModel):
    real_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None


# ---- 通用响应 ----
class ApiResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None


class ApiListResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None
