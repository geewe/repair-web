#!/bin/bash
# ═══════════════════════════════════════════════════════════
# 打包 repair_web 到桌面，方便上传到群晖 NAS
# ═══════════════════════════════════════════════════════════
# 使用方法: 双击运行，或终端执行 bash pack_for_nas.sh
# ═══════════════════════════════════════════════════════════

cd "$(dirname "$0")"

# 打包成一个 zip，忽略 node_modules 等
ZIP_NAME="repair-web-nas.zip"
zip -r "$HOME/Desktop/$ZIP_NAME" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "data/*.db*" \
  -x "data/server.log" \
  -x "data/server.pid" \
  -x ".gitignore" \
  > /dev/null 2>&1

echo ""
echo "✅ 打包完成!"
echo "  桌面已生成: $ZIP_NAME"
echo "  大小: $(du -h "$HOME/Desktop/$ZIP_NAME" | cut -f1)"
echo ""
echo "  接下来请把这个文件上传到群晖 NAS"
echo ""
