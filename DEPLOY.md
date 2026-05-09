# 智慧图书馆推荐系统 - 部署指南

## 快速部署 (Docker)

### 1. 配置环境变量
cp .env.example .env

编辑 .env 填入智谱API Key

### 2. 一键启动
docker-compose up -d

### 3. 验证
curl http://localhost/api/health

打开浏览器 http://localhost

### 4. 停止
docker-compose down

## 手动部署

### 1. 安装依赖
pip install -r requirements.txt
cd src/frontend && npm ci

### 2. 启动服务
bash start.sh    # Linux/Mac
start.bat        # Windows

### 3. 数据备份
bash scripts/backup.sh    # Linux/Mac
scripts\backup.bat        # Windows

### 4. 数据恢复
bash scripts/restore.sh backups/smart_library_YYYYMMDD_HHMMSS.db.gz

## 服务端口
- 80: 前端页面
- 8000: 后端API + Swagger文档 (/docs)
- 8001: 模拟数据源API
