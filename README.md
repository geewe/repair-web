# 🔧 外设维修工坊 — 后端服务器

维修工坊管理系统的 API 后端 + Web 管理界面。支持工单管理、客户管理、配件库存、数据报表等。

---

## 🚀 一键安装（适合新手）

### 方法一：终端一键安装（推荐）

**第 1 步：** 打开「终端」App（按 `Cmd+空格` 搜索"终端"）

**第 2 步：** 粘贴这行命令，按回车：

```bash
cd ~/Desktop/repair_web && chmod +x install.sh && ./install.sh
```

**第 3 步：** 等待安装完成，看到 🎉 安装成功 就搞定了

**第 4 步：** 浏览器打开 http://localhost:3456 开始使用

> 默认账号: `admin` / 密码: `admin123`

---

### 方法二：手动安装

```bash
# 1. 进入项目目录
cd ~/Desktop/repair_web

# 2. 安装 Node.js（如已安装可跳过）
#    去 https://nodejs.org 下载安装

# 3. 安装依赖
npm install

# 4. 启动服务
./start.sh
```

---

## 📱 日常管理命令

```bash
./start.sh      # 启动服务
./stop.sh       # 停止服务
./status.sh     # 查看运行状态
```

服务默认运行在 **http://localhost:3456**

---

## 🔄 开机自启（重启电脑后自动启动）

```bash
./setup-autostart.sh
```

运行一次即可，之后每次开机都会自动启动维修工坊。

取消自启：
```bash
launchctl unload ~/Library/LaunchAgents/com.repair-web.server.plist
```

---

## 🌐 局域网 / 外网访问

同一局域网的其他设备访问 `http://你电脑的IP:3456`

- **Mac 查看 IP：** 系统设置 → 网络 → 查看 IP 地址
- 或者在终端输入 `ipconfig getifaddr en0`

配合端口转发（路由器设置）或内网穿透（如 frp、Ngrok）即可外网访问。

---

## 🐳 用 Docker（进阶）

如果已安装 Docker，也可以用 Docker 启动：

```bash
docker compose up -d
```

---

## 📂 项目结构

```
repair_web/
├── install.sh               ← 一键安装（推荐）
├── start.sh / stop.sh / status.sh  ← 日常管理
├── setup-autostart.sh       ← 设置开机自启
├── server.js                ← 后端 API 服务
├── data/
│   └── repair.db            ← 数据库文件（自动创建）
├── public/
│   ├── index.html           ← Web 管理界面
│   ├── css/app.css
│   └── js/app.js
├── package.json
└── docker-compose.yml
```

---

## 🔧 常见问题

**Q：提示 `command not found: node`？**  
A：install.sh 会自动安装 Node.js，或者手动去 https://nodejs.org 下载安装。

**Q：如何修改端口？**  
A：在终端先 `export PORT=3457` 再启动，或者编辑 `start.sh`。

**Q：忘记密码？**  
A：删除 `data/repair.db` 重启服务即可重置为 admin/admin123。

**Q：数据存在哪里？**  
A：所有数据存在 `data/repair.db`，备份这个文件即可。
