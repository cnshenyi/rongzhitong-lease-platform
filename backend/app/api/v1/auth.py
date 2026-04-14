"""
融智通 - 认证路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas import LoginRequest, ApiResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """用户登录"""
    user = await AuthService.authenticate_user(db, request.username, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    
    token_info = AuthService.create_token(user)
    
    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "token": token_info["token"],
            "expires_in": token_info["expires_in"],
            "user": {
                "id": str(token_info["user"].id),
                "username": token_info["user"].username,
                "real_name": token_info["user"].real_name,
                "email": token_info["user"].email,
                "role": token_info["user"].role,
                "department": token_info["user"].department,
                "avatar_url": token_info["user"].avatar_url,
                "tenant_id": str(token_info["user"].tenant_id),
            }
        }
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """用户登出"""
    return {
        "code": 200,
        "message": "登出成功",
        "data": None
    }


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return {
        "code": 200,
        "message": "success",
        "data": {
            "id": str(current_user.id),
            "username": current_user.username,
            "real_name": current_user.real_name,
            "email": current_user.email,
            "role": current_user.role,
            "department": current_user.department,
            "avatar_url": current_user.avatar_url,
            "tenant_id": str(current_user.tenant_id),
        }
    }
