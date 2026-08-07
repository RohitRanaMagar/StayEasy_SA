from dotenv import load_dotenv

from fastapi import FastAPI, Depends
from app.config.database_config import engine, Base
from app.modules.auth.models import *
from app.modules.auth.seed import seed_superadmin
from app.modules.auth.routers.login_router import router as login_router
from app.modules.auth.routers.password_reset_router import (
    router as password_reset_router,
)
from app.middlewares.cors import configure_cors
from app.utils.exception_handlers import register_exception_handlers
from app.middlewares.rate_limiter import RateLimiter
from app.config.redis_config import redis_pool
from app.utils.logging import LoggerFactory

import redis.asyncio as aioredis
from contextlib import asynccontextmanager

load_dotenv()

logger = LoggerFactory.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_superadmin(engine)
    app.state.redis_client = aioredis.Redis(connection_pool=redis_pool)

    yield

    await app.state.redis_client.close()
    await redis_pool.disconnect()
    await engine.dispose()


global_limiter = RateLimiter(max_requests=150, window_seconds=60, scope="global")

app = FastAPI(
    lifespan=lifespan,
    title="StayEasy API",
    version="1.0.0",
    root_path="/api/v1",
    dependencies=[Depends(global_limiter)],
)


register_exception_handlers(app)

configure_cors(app)

app.include_router(login_router)
app.include_router(password_reset_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Easy Booking System API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
