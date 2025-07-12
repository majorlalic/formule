#!/bin/bash

# ====== 配置路径（修改为你自己的） ======
NGINX_BIN="nginx"               # Nginx 可执行文件路径（brew 安装）
NGINX_CONF="/Users/sketch/Documents/project/formule/conf/nginx_develop.conf"            # 你的自定义配置文件路径

# ====== 检查 nginx 是否正在运行 ======
echo "Checking if nginx is running..."
if pgrep -x nginx >/dev/null; then
  echo "Nginx is running, stopping it..."
  $NGINX_BIN -s stop
  sleep 1
else
  echo "Nginx is not running."
fi

# ====== 启动 nginx ======
echo "Starting nginx with config: $NGINX_CONF"
$NGINX_BIN -c "$NGINX_CONF"
