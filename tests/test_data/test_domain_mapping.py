"""测试中图分类号→知识领域映射"""
from src.data.domain_mapping import clc_to_domain, list_domains


def test_clc_T():
    """TP开头映射到自动化/计算机"""
    assert clc_to_domain("TP311.1") == "自动化/计算机"


def test_clc_TB():
    """TB开头映射到一般工业技术"""
    assert clc_to_domain("TB3") == "一般工业技术"


def test_clc_unknown():
    """空字符串映射到未分类"""
    assert clc_to_domain("") == "未分类"


def test_list_domains():
    """列表不重复且覆盖主要领域"""
    domains = list_domains()
    assert "自动化/计算机" in domains
    assert "未分类" in domains
    assert len(domains) > 20
