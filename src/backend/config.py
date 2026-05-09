"""应用配置"""
import os


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///smart_library.db")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "6fb6bffa8c114e78ac4da3c72781b528.q90BoSiQil1ut5jA")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "GLM-4-Flash")
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))


settings = Settings()
