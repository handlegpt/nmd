# 使用 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 设置生产环境变量
ENV NODE_ENV=production
ENV EXPO_WEB_OPTIMIZE=true
ENV EXPO_WEB_MINIFY=true
ENV EXPO_DEBUG=false
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV EXPO_WEB_BUNDLE_ANALYZER=false
ENV EXPO_WEB_SOURCE_MAPS=false
ENV EXPO_WEB_CACHE=true
ENV EXPO_WEB_COMPRESS=true
ENV EXPO_WEB_GZIP=true

# 构建生产版本
RUN npm run build

# 暴露端口
EXPOSE 19006

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:19006/ || exit 1

# 启动生产服务器
CMD ["npm", "run", "start:prod"] 