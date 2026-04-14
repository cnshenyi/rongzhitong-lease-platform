"""
融智通 - 用户路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.db.session import get_db
from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_admin_user

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("")
async def list_users(
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户列表"""
    query = select(User).where(
        User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None)
    )
    
    if keyword:
        query = query.where(
            (User.username.ilike(f"%{keyword}%")) |
            (User.real_name.ilike(f"%{keyword}%"))
        )
    
    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "id": str(user.id),
                    "username": user.username,
                    "real_name": user.real_name,
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role,
                    "department": user.department,
                    "status": user.status,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                }
                for user in users
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }
    }


@router.post("")
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """创建用户"""
    # 检查用户名是否已存在
    result = await db.execute(
        select(User).where(
            User.tenant_id == current_user.tenant_id,
            User.username == user_data.username,
            User.deleted_at.is_(None)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已存在",
        )
    
    # 创建用户
    new_user = User(
        tenant_id=current_user.tenant_id,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        real_name=user_data.real_name,
        email=user_data.email,
        phone=user_data.phone,
        role=user_data.role,
        department=user_data.department,
        created_by=current_user.id,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "code": 200,
        "message": "创建成功",
        "data": {
            "id": str(new_user.id),
            "username": new_user.username,
        }
    }
