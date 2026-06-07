#!/bin/bash

# ==============================================================================
# Glass Portfolio 自动化部署脚本 (Linux/Docker)
# ==============================================================================

APP_NAME="glass-portfolio"
APP_PORT="8080"

echo ">>>> 开始执行部署流程 <<<<"

# 1. 拉取最新代码 (假设已在项目根目录)
# git pull origin main

# 2. 编译打包
echo ">>>> 正在编译项目..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo ">>>> 编译失败，请检查代码错误！"
    exit 1
fi

# 3. 停止并删除旧容器
echo ">>>> 正在清理旧容器..."
docker stop $APP_NAME 2>/dev/null
docker rm $APP_NAME 2>/dev/null

# 4. 构建镜像
echo ">>>> 正在构建 Docker 镜像..."
docker build -t $APP_NAME:latest .

# 5. 启动新容器
echo ">>>> 正在启动新服务..."
docker run -d \
    --name $APP_NAME \
    --restart always \
    -p $APP_PORT:8080 \
    -v /etc/localtime:/etc/localtime:ro \
    -v /app/uploads:/app/uploads \
    $APP_NAME:latest

echo ">>>> 部署完成！服务运行在端口: $APP_PORT <<<<"
echo ">>>> 请检查 Nginx 状态以确保 HTTPS 访问正常。 <<<<"
