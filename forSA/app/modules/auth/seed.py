import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.modules.auth.models.users_model import User
from app.modules.auth.services.auth_services import AuthService
from app.utils.logging import LoggerFactory

logger = LoggerFactory.get_logger(__name__)


async def seed_superadmin(engine) -> None:
    email = os.getenv("SEEDED_SUPERADMIN_EMAIL")
    password = os.getenv("SEEDED_SUPERADMIN_PASSWORD")
    full_name = os.getenv("SEEDED_SUPERADMIN_FULL_NAME", "Super Admin")

    if not email or not password:
        logger.warning("[Seed] Missing SEEDED_SUPERADMIN_EMAIL or SEEDED_SUPERADMIN_PASSWORD — skipping seed")
        return

    try:
        async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            result = await session.execute(select(User).where(User.email == email))
            existing = result.scalar_one_or_none()

            if existing:
                logger.info("[Seed] Superadmin already seeded — skipping")
                return

            auth_service = AuthService()
            hashed_password = auth_service.get_password_hash(password)

            superadmin = User(
                email=email,
                hashed_password=hashed_password,
                role="superadmin",
                full_name=full_name,
                is_active=True,
            )
            session.add(superadmin)
            await session.commit()
            logger.info(f"[Seed] Superadmin created: {email}")

    except Exception as e:
        logger.error(f"[Seed] Failed to seed superadmin: {e}")
