#!/bin/bash
# 数据库备份脚本
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
DB_FILE="data/smart_library.db"

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/smart_library_$TIMESTAMP.db"

if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_FILE"
    gzip "$BACKUP_FILE"
    echo "✅ 备份完成: ${BACKUP_FILE}.gz ($(du -h ${BACKUP_FILE}.gz | cut -f1))"
    # 保留最近7天备份
    ls -t $BACKUP_DIR/*.gz 2>/dev/null | tail -n +8 | xargs -r rm
else
    echo "❌ 数据库文件不存在: $DB_FILE"
    exit 1
fi
