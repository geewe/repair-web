#!/bin/bash
# 外设维修工坊 · 启动服务
cd "$(dirname "$0")"
PID_FILE="data/server.pid"
LOG_FILE="data/server.log"

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "⚠ 服务已在运行 (PID: $OLD_PID)"
        echo "  如要重启请先运行 ./stop.sh"
        exit 0
    fi
fi

mkdir -p data
nohup node server.js > "$LOG_FILE" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"
sleep 1

if kill -0 $PID 2>/dev/null; then
    echo "✔ 服务已启动 (PID: $PID)"
    echo "  访问: http://localhost:3456"
else
    echo "✘ 启动失败，查看日志: cat $LOG_FILE"
    exit 1
fi
