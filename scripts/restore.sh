#!/bin/bash
# 数据库恢复脚本
if [ -z "$1" ]; then
    echo "用法: bash scripts/restore.sh backups/smart_library_20260509_120000.db.gz"
    echo "可用备份:"
    ls -lh backups/*.gz 2>/dev/null || echo "  (无备份文件)"
    exit 1
fi

DB_FILE="data/smart_library.db"
BACKUP_FILE="$1"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" > "$DB_FILE"
else
    cp "$BACKUP_FILE" "$DB_FILE"
fi
echo "✅ 恢复完成: $DB_FILE (从 $BACKUP_FILE)"
