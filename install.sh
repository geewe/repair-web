#!/bin/bash
# ═══════════════════════════════════════════════════════════
# 外设维修工坊 · 一键安装脚本
# ═══════════════════════════════════════════════════════════
# 使用方法: 打开终端，粘贴这行按回车：
#   cd ~/Desktop/repair_web && chmod +x install.sh && ./install.sh
# ═══════════════════════════════════════════════════════════

set -e

# ── 颜色 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}ℹ${NC} $1"; }
ok()    { echo -e "${GREEN}✔${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
err()   { echo -e "${RED}✘${NC} $1"; }

echo ""
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo -e "${BLUE}  外设维修工坊 · 一键安装${NC}"
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo ""

# ── 1. 检测 Node.js ──
info "检测 Node.js..."
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    ok "Node.js 已安装: $NODE_VER"
else
    warn "未安装 Node.js，正在自动安装..."
    # 检测系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - 用 Homebrew 安装
        if ! command -v brew &>/dev/null; then
            info "正在安装 Homebrew（包管理器）..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            ok "Homebrew 安装完成"
        fi
        info "正在通过 Homebrew 安装 Node.js..."
        brew install node
        ok "Node.js 安装完成: $(node -v)"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &>/dev/null; then
            sudo apt-get update -qq && sudo apt-get install -y -qq nodejs npm
        elif command -v yum &>/dev/null; then
            sudo yum install -y nodejs npm
        else
            err "暂不支持当前 Linux 发行版，请手动安装 Node.js https://nodejs.org"
            exit 1
        fi
        ok "Node.js 安装完成: $(node -v)"
    else
        err "不支持的操作系统: $OSTYPE"
        echo "  请手动安装 Node.js https://nodejs.org 后重新运行"
        exit 1
    fi
fi

# ── 2. 安装依赖 ──
echo ""
info "安装项目依赖..."
cd "$(dirname "$0")"
npm install --silent 2>&1 | tail -1
ok "依赖安装完成"

# ── 3. 创建数据目录 ──
mkdir -p data

# ── 4. 防火墙提示 ──
echo ""
info "服务将运行在端口 3456"
echo -e "  如果本机有防火墙，请放行端口 3456"

# ── 5. 启动服务 ──
echo ""
info "正在启动服务..."
echo ""

# 后台启动，输出日志
nohup node server.js > data/server.log 2>&1 &
SERVER_PID=$!

# 等待启动
sleep 2
if kill -0 $SERVER_PID 2>/dev/null; then
    ok "服务已启动 (PID: $SERVER_PID)"

    # 获取本机局域网IP
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "?")
    else
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "?")
    fi

    echo ""
    echo -e "${GREEN}══════════════════════════════════════${NC}"
    echo -e "${GREEN}  🎉 安装成功！${NC}"
    echo -e "${GREEN}══════════════════════════════════════${NC}"
    echo ""
    echo -e "  本机访问:  ${BLUE}http://localhost:3456${NC}"
    echo -e "  局域网:    ${BLUE}http://$LOCAL_IP:3456${NC}"
    echo -e "  外网访问:  ${BLUE}http://你的域名:3456${NC}"
    echo ""
    echo -e "  ${YELLOW}管理命令:${NC}"
    echo -e "    ./status.sh   查看运行状态"
    echo -e "    ./stop.sh     停止服务"
    echo -e "    ./start.sh    启动服务"
    echo ""
else
    err "服务启动失败，查看日志: cat data/server.log"
    exit 1
fi
