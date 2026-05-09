"""中图分类法→知识领域映射"""
import json
from pathlib import Path


_MAPPING: dict[str, str] = {}


def load_mapping(path: str | None = None) -> dict[str, str]:
    """加载领域映射表，缓存到模块级变量"""
    global _MAPPING
    if _MAPPING:
        return _MAPPING
    if path is None:
        path = Path(__file__).parent.parent.parent / "data" / "domain_mapping.json"
    with open(path, "r", encoding="utf-8") as f:
        _MAPPING = json.load(f)
    return _MAPPING


def clc_to_domain(clc_number: str) -> str:
    """将中图分类号映射到知识领域。按最长前缀匹配"""
    mapping = load_mapping()
    clc = clc_number.strip().upper()
    best_key = "UNKNOWN"
    best_len = 0
    for key in mapping:
        if clc.startswith(key) and len(key) > best_len:
            best_key = key
            best_len = len(key)
    return mapping[best_key]


def list_domains() -> list[str]:
    """返回所有一级领域名称（去重）"""
    return sorted(set(load_mapping().values()))
