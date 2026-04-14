"""
融智通 - 数据库初始化脚本（创建表 + 默认数据）
"""
import asyncio
import sys
import os

# 确保项目根目录在路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, AsyncSessionLocal, Base
from app.models.models import Tenant, User
from app.core.security import get_password_hash
from sqlalchemy import select
import uuid


async def init_db():
    """初始化数据库：创建表 + 插入默认数据"""
    print("正在创建数据库表...")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("数据库表创建完成！")
    
    # 创建默认租户和管理员
    async with AsyncSessionLocal() as session:
        # 检查是否已有默认租户
        result = await session.execute(
            select(Tenant).where(Tenant.code == "default")
        )
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            tenant_id = uuid.uuid4()
            tenant = Tenant(
                id=tenant_id,
                name="默认租户",
                code="default",
                contact_person="系统管理员",
                plan="enterprise",
                max_users=100,
                status="active",
            )
            session.add(tenant)
            await session.flush()
            print(f"创建默认租户：{tenant.name} (ID: {tenant.id})")
        else:
            tenant_id = tenant.id
            print(f"默认租户已存在：{tenant.name}")
        
        # 检查是否已有admin用户
        result = await session.execute(
            select(User).where(User.username == "admin", User.tenant_id == tenant_id)
        )
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            admin_user = User(
                tenant_id=tenant_id,
                username="admin",
                password_hash=get_password_hash("admin123"),
                real_name="系统管理员",
                email="admin@rongzhitong.com",
                role="super_admin",
                department="系统管理",
                status="active",
            )
            session.add(admin_user)
            print(f"创建管理员用户：admin / admin123")
        else:
            print(f"管理员用户已存在：admin")
        
        await session.commit()
    
    print("\n数据库初始化完成！")
    print("=" * 50)
    print("默认管理员账号：admin")
    print("默认管理员密码：admin123")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(init_db())
