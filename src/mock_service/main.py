"""Mock data source service - FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import library, academic
from .data_store import init_data

app = FastAPI(title="高校数据源模拟服务", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(library.router)
app.include_router(academic.router)


@app.on_event("startup")
def startup():
    init_data()  # generate 300 students + 5000 borrows + 3000 course records + 50 books


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mock-data-source"}
