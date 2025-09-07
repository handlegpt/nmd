#!/bin/bash

echo "🔍 诊断 Directus 环境变量问题"

# 1. 检查 .env 文件中的数据库配置
echo "📋 .env 文件中的数据库配置："
echo "DB_HOST: $(grep '^DB_HOST=' .env | cut -d'=' -f2)"
echo "DB_PORT: $(grep '^DB_PORT=' .env | cut -d'=' -f2)"
echo "DB_USER: $(grep '^DB_USER=' .env | cut -d'=' -f2)"
echo "DB_DATABASE: $(grep '^DB_DATABASE=' .env | cut -d'=' -f2)"
echo "DB_PASSWORD: $(grep '^DB_PASSWORD=' .env | cut -d'=' -f2 | cut -c1-3)***"

# 2. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 3. 检查 docker-compose 配置
echo "🔍 检查 docker-compose 配置..."
echo "连接字符串模板："
grep "DB_CONNECTION_STRING" docker-compose.yml

# 4. 手动构建连接字符串
echo "🔗 手动构建连接字符串："
source .env
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?sslmode=disable&sslcert=&sslkey=&sslrootcert=&application_name=directus"
echo "完整连接字符串: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?sslmode=disable&sslcert=&sslkey=&sslrootcert=&application_name=directus"

# 5. 测试数据库连接（如果可能）
echo "🧪 测试数据库连接..."
if command -v psql &> /dev/null; then
    echo "尝试连接数据库..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_DATABASE}" -c "SELECT 1;" 2>&1 | head -5
else
    echo "psql 不可用，跳过连接测试"
fi

# 6. 重新启动服务
echo "🚀 重新启动服务..."
docker-compose up -d

# 7. 等待启动
echo "⏳ 等待服务启动..."
sleep 15

# 8. 检查状态
echo "📊 检查容器状态..."
docker-compose ps

# 9. 检查日志
echo "📋 检查 Directus 日志..."
docker-compose logs directus --tail=20

echo "✅ 诊断完成！"
