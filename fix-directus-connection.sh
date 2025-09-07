#!/bin/bash

echo "🔧 修复 Directus 数据库连接问题"

# 1. 停止所有容器
echo "📦 停止所有容器..."
docker-compose down

# 2. 检查环境变量文件
echo "🔍 检查环境变量配置..."
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在，从 env.example 创建..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件，填入正确的数据库连接信息"
    echo "   特别是以下变量："
    echo "   - DB_PASSWORD (Supabase 数据库密码)"
    echo "   - KEY (Directus 密钥)"
    echo "   - SECRET (Directus 密钥)"
    echo "   - ADMIN_PASSWORD (Directus 管理员密码)"
    exit 1
fi

# 3. 检查关键环境变量
echo "🔍 检查关键环境变量..."
source .env

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD 未设置"
    exit 1
fi

if [ -z "$KEY" ]; then
    echo "❌ KEY 未设置"
    exit 1
fi

if [ -z "$SECRET" ]; then
    echo "❌ SECRET 未设置"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 4. 清理旧的 Directus 数据（如果需要）
echo "🧹 清理旧的 Directus 数据..."
docker volume rm nmd_directus_uploads nmd_directus_snapshots 2>/dev/null || true

# 5. 重新启动服务
echo "🚀 重新启动服务..."
docker-compose up -d

# 6. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 7. 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 8. 检查 Directus 日志
echo "📋 检查 Directus 日志..."
docker-compose logs directus --tail=20

echo "✅ 修复完成！"
echo "🌐 Directus 管理面板: http://localhost:8055"
echo "👤 默认管理员: admin@nomad.now"
echo "🔑 密码: 请检查 .env 文件中的 ADMIN_PASSWORD"
