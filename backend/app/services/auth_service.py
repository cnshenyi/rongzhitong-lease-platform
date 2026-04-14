"""
融智通 - 认证服务
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models import User
from app.core.security import verify_password, create_access_token
from app.schemas import UserInfo


class AuthService:
    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
        """验证用户"""
        result = await db.execute(
            select(User).where(
                User.username == username,
                User.deleted_at.is_(None),
                User.status == "active"
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # 更新登录信息
        user.last_login_at = datetime.utcnow()
        user.login_count += 1
        await db.commit()
        
        return user

    @staticmethod
    def create_token(user: User) -> dict:
        """创建访问令牌"""
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "tenant_id": str(user.tenant_id),
            "role": user.role,
        }
        access_token = create_access_token(token_data)
        
        return {
            "token": access_token,
            "expires_in": 86400,  # 24 hours
            "user": UserInfo.model_validate(user)
        }
