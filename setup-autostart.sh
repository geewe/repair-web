#!/bin/bash
# ═══════════════════════════════════════════════════════════
# 设置开机自启（macOS）
# ═══════════════════════════════════════════════════════════
# 运行一次即可，之后电脑开机 / 重启都会自动启动维修工坊服务
# ═══════════════════════════════════════════════════════════

cd "$(dirname "$0")"

PLIST="com.repair-web.server.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$PLIST"

# 1. 修正 plist 中的路径为当前实际路径
CURRENT_DIR=$(pwd)
sed -i '' "s|/Users/simon/Desktop/repair_web|$CURRENT_DIR|g" "$PLIST" 2>/dev/null || true

# 2. 复制到 LaunchAgents
cp "$PLIST" "$PLIST_DST"

# 3. 加载
launchctl load "$PLIST_DST" 2>/dev/null || launchctl bootstrap gui/$(id -u) "$PLIST_DST" 2>/dev/null

echo ""
echo "✔ 开机自启已设置"
echo "  服务将在每次开机时自动启动"
echo "  手动管理:"
echo "    launchctl stop com.repair-web.server    # 停止"
echo "    launchctl start com.repair-web.server   # 启动"
echo "    launchctl unload ~/Library/LaunchAgents/$PLIST  # 取消自启"
echo ""
