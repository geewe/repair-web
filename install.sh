#!/bin/bash
# ═══════════════════════════════════════════════════════════
# 外设维修工坊 · 一键安装（GitHub 远程安装版）
# ═══════════════════════════════════════════════════════════
# 使用方法（任选一条）:
#   curl -fsSL https://git.io/repair-web | bash
#   或
#   bash <(curl -fsSL https://raw.githubusercontent.com/geewe/repair-web/main/install.sh)
# ═══════════════════════════════════════════════════════════

set -e

# ── 颜色 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${BLUE}ℹ${NC} $1"; }
ok()    { echo -e "${GREEN}✔${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
err()   { echo -e "${RED}✘${NC} $1"; }
step()  { echo -e "\n${CYAN}── $1 ──${NC}"; }

# ── 配置 ──
REPO="geewe/repair-web"
BRANCH="main"
INSTALL_DIR="$HOME/repair-web"
PORT=${PORT:-3456}

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}  外设维修工坊 · GitHub 一键安装${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# ── 1. 检测 Git ──
step "1/5  检测系统环境"
if ! command -v git &>/dev/null; then
    warn "未安装 Git，正在自动安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        xcode-select --install 2>/dev/null || true
        # 等待用户完成 xcode 安装
        until command -v git &>/dev/null; do
            echo "  请在弹出的窗口中点击「安装」，完成后按 Enter 继续..."
            read -r
        done
    elif command -v apt-get &>/dev/null; then
        sudo apt-get install -y -qq git
    elif command -v yum &>/dev/null; then
        sudo yum install -y git
    fi
    ok "Git 安装完成"
else
    ok "Git 已安装"
fi

# ── 2. 检测 Node.js ──
if ! command -v node &>/dev/null; then
    warn "未安装 Node.js，正在自动安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &>/dev/null; then
            info "正在安装 Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node
    elif command -v apt-get &>/dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq nodejs npm
    elif command -v yum &>/dev/null; then
        sudo yum install -y nodejs npm
    else
        err "无法自动安装 Node.js"
        echo "  请手动安装: https://nodejs.org (下载 LTS 版)"
        exit 1
    fi
    ok "Node.js 安装完成: $(node -v)"
else
    ok "Node.js 已安装: $(node -v)"
fi

# ── 3. 下载代码 ──
step "2/5  下载代码"
if [ -d "$INSTALL_DIR" ]; then
    info "目录已存在，正在更新..."
    cd "$INSTALL_DIR"
    git pull origin "$BRANCH" 2>/dev/null || {
        warn "更新失败，重新克隆..."
        cd .. && rm -rf "$INSTALL_DIR"
        git clone --depth 1 -b "$BRANCH" "https://github.com/$REPO.git" "$INSTALL_DIR"
    }
else
    info "正在从 GitHub 克隆代码..."
    git clone --depth 1 -b "$BRANCH" "https://github.com/$REPO.git" "$INSTALL_DIR"
fi
cd "$INSTALL_DIR"
ok "代码已下载到: $INSTALL_DIR"

# ── 4. 安装依赖 ──
step "3/5  安装依赖"
npm install --silent 2>&1 | tail -1
ok "依赖安装完成"

# ── 5. 创建管理脚本别名 ──
step "4/5  配置管理命令"
# 在 ~/.zshrc 中添加快捷命令
ALIAS_LINE="# repair-web aliases"
ALIAS_START="# --- repair-web ---"
ALIAS_END="# --- end repair-web ---"
ALIAS_BLOCK="$ALIAS_START
alias rw-start='cd $INSTALL_DIR && nohup node server.js > data/server.log 2>&1 &'
alias rw-stop='cd $INSTALL_DIR && kill \$(cat data/server.pid 2>/dev/null) 2>/dev/null; rm -f data/server.pid'
alias rw-status='cd $INSTALL_DIR && curl -s -o /dev/null -w \"%{http_code}\" http://localhost:$PORT/api/stats 2>/dev/null && echo \"服务运行中\" || echo \"服务未运行\"'
alias rw-logs='tail -f $INSTALL_DIR/data/server.log'
alias rw-update='cd $INSTALL_DIR && git pull && npm install'
$ALIAS_END"

if [[ "$SHELL" == *"zsh" ]]; then
    RC_FILE="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash" ]]; then
    RC_FILE="$HOME/.bashrc"
else
    RC_FILE="$HOME/.zshrc"
fi

if [ -f "$RC_FILE" ] && ! grep -q "$ALIAS_START" "$RC_FILE" 2>/dev/null; then
    echo "" >> "$RC_FILE"
    echo "$ALIAS_BLOCK" >> "$RC_FILE"
    ok "快捷命令已添加到 $RC_FILE（重新打开终端生效）"
    echo "  或现在执行: source $RC_FILE"
else
    info "快捷命令已存在，跳过"
fi

# ── 6. 启动服务 ──
step "5/5  启动服务"
mkdir -p data

# 检查是否已有进程在运行
if curl -s -o /dev/null -w "" http://localhost:$PORT/api/stats 2>/dev/null; then
    warn "服务已在运行"
else
    nohup node server.js > data/server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > data/server.pid
    sleep 2

    if kill -0 $SERVER_PID 2>/dev/null; then
        ok "服务已启动 (PID: $SERVER_PID)"
    else
        err "启动失败，查看日志: cat $INSTALL_DIR/data/server.log"
        exit 1
    fi
fi

# 获取本机 IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "?")
else
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "?")
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 安装成功！${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  📂 安装路径:  $INSTALL_DIR"
echo -e "  🌐 本机访问:  ${BLUE}http://localhost:$PORT${NC}"
echo -e "  🌐 局域网:    ${BLUE}http://$LOCAL_IP:$PORT${NC}"
echo ""
echo -e "  ${YELLOW}📋 管理命令（新终端窗口生效）:${NC}"
echo -e "    rw-status     查看服务状态"
echo -e "    rw-logs       查看实时日志"
echo -e "    rw-stop       停止服务"
echo -e "    rw-start      启动服务"
echo -e "    rw-update     更新到最新版本"
echo ""
echo -e "  ${YELLOW}或直接进入目录操作:${NC}"
echo -e "    cd $INSTALL_DIR"
echo -e "    ./start.sh    启动"
echo -e "    ./stop.sh     停止"
echo -e "    ./status.sh   状态"
echo ""
echo -e "  ${YELLOW}默认账号:${NC} admin / admin123"
echo ""
