#!/bin/bash
# 外设维修工坊 · 查看状态
cd "$(dirname "$0")"
PID_FILE="data/server.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "✔ 服务运行中 (PID: $PID)"
        echo "  本机:  http://localhost:3456"
        # 显示最近5条日志
        echo ""
        tail -5 data/server.log 2>/dev/null | while read line; do echo "  📋 $line"; done
        exit 0
    fi
fi

# 检查是否还有其他 node server.js 进程
PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
if [ -n "$PID" ]; then
    echo "⚠ 服务运行中，但 PID 文件缺失 (PID: $PID)"
else
    echo "ℹ 服务未运行"
fi
