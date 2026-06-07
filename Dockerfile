# 基础镜像使用 Java 17
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 将打包好的 jar 包拷贝进镜像
# 注意：在运行 docker build 前需要执行 mvn clean package
COPY target/glass-portfolio-1.0.0.jar app.jar

# 暴露端口（与 application.yml 中的 server.port 保持一致）
EXPOSE 8080

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
