# 🔧 外设维修工坊 — 后端服务器

维修工坊管理系统的 API 后端 + Web 管理界面。支持工单管理、客户管理、配件库存、数据报表等。

---

## 🚀 一键安装（一条命令，适合新手）

打开「终端」App（按 `Cmd+空格` 搜索"终端"），粘贴这条命令按回车：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/geewe/repair-web/main/install.sh)
```

或者用短链接：

```bash
curl -fsSL https://git.io/repair-web | bash
```

> ⏳ 脚本会自动安装 Node.js（如需）→ 下载代码 → 安装依赖 → 启动服务  
> 全程自动，看到 🎉 安装成功 就搞定了  
> 浏览器打开 http://localhost:3456，账号 `admin` / 密码 `admin123`

---

## 📱 日常管理

安装完成后，重新打开终端就可以用这些快捷命令：

| 命令 | 作用 |
|------|------|
| `rw-status` | 查看服务运行状态 |
| `rw-start` | 启动服务 |
| `rw-stop` | 停止服务 |
| `rw-logs` | 查看实时日志 |
| `rw-update` | 更新到最新版本 |

或者进入安装目录操作：

```bash
cd ~/repair-web
./start.sh      # 启动
./stop.sh       # 停止
./status.sh     # 状态
```

---

## 🔄 开机自启

```bash
cd ~/repair-web && bash setup-autostart.sh
```

---

## 🌐 局域网 / 外网访问

同一局域网访问 `http://你电脑的IP:3456`

查看本机 IP：`ipconfig getifaddr en0`（Mac）或 `hostname -I`（Linux）

---

## 🔧 常见问题

**Q：提示 `command not found: node`？**  
A：脚本会自动安装 Node.js，无需手动操作。

**Q：如何修改端口？**  
A：安装时指定端口：`PORT=3457 bash <(curl -fsSL ...)`

**Q：忘记密码？**  
A：`rm ~/repair-web/data/repair.db` 重启服务即可重置 admin/admin123。

**Q：数据存在哪里？**  
A：`~/repair-web/data/repair.db`，备份这个文件即可。

**Q：如何更新到最新版？**  
A：终端执行 `rw-update` 或在目录里执行 `git pull && npm install`。
