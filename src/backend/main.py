"""FastAPI应用入口"""
import sys
import logging
import traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import init_db
from .routers import admin, students, dialogue, teacher, books, auth

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.FileHandler('app.log', encoding='utf-8'), logging.StreamHandler()]
)
logger = logging.getLogger("smart_library")
logger.info("Application starting")

app = FastAPI(title="智慧图书馆推荐系统", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(students.router)
app.include_router(dialogue.router)
app.include_router(teacher.router)
app.include_router(books.router)


@app.middleware("http")
async def global_exception_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        traceback.print_exc()
        logger.exception("Unhandled exception processing request: %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": f"服务器内部错误: {str(e)[:200]}"})


@app.on_event("startup")
def startup():
    init_db()
    logger.info("Database initialized")


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
