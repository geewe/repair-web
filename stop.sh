#!/bin/bash
# 外设维修工坊 · 停止服务
cd "$(dirname "$0")"
PID_FILE="data/server.pid"

if [ ! -f "$PID_FILE" ]; then
    # 尝试通过进程名查找
    PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
    if [ -z "$PID" ]; then
        echo "ℹ 服务未运行"
        exit 0
    fi
else
    PID=$(cat "$PID_FILE")
fi

kill $PID 2>/dev/null && echo "✔ 服务已停止 (PID: $PID)" || echo "ℹ 服务未运行"
rm -f "$PID_FILE"
