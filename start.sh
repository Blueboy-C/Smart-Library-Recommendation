#!/bin/bash
echo "=== 智慧图书馆推荐系统 ==="
echo "启动模拟数据源服务 (port 8001)..."
cd src && python -m uvicorn mock_service.main:app --host 0.0.0.0 --port 8001 &
sleep 2

echo "启动主后端服务 (port 8000)..."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
sleep 3

echo "同步外部数据..."
curl -s -X POST http://localhost:8000/api/admin/import/sync
echo ""

echo "启动前端 (port 5173)..."
cd src/frontend && npm run dev -- --host 0.0.0.0 &
sleep 3

echo ""
echo "=== 系统已启动 ==="
echo "前端页面:  http://localhost:5173"
echo "API文档:   http://localhost:8000/docs"
echo "数据源API: http://localhost:8001/docs"
echo "健康检查:  http://localhost:8000/api/health"
