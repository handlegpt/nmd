#!/bin/bash

echo "🚀 开始设置 NomadNow 项目..."

# 检查是否安装了 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建环境变量文件模板
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件模板..."
    cat > .env << EOF
# Supabase 配置
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 其他配置
NODE_ENV=development
EOF
    echo "✅ 已创建 .env 文件，请编辑并填入你的 Supabase 配置"
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建 Docker 镜像
echo "🐳 构建 Docker 镜像..."
docker-compose build

echo "✅ 设置完成！"
echo ""
echo "📋 下一步："
echo "1. 编辑 .env 文件，填入你的 Supabase 配置"
echo "2. 在 Supabase 中创建数据库表（参考 README.md）"
echo "3. 运行 'docker-compose up' 启动项目"
echo "4. 在浏览器中打开 http://localhost:19002 查看 Expo DevTools"
echo ""
echo "🎉 祝你开发愉快！" 