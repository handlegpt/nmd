#!/bin/bash

# =====================================================
# Nomad Agent API 端点测试脚本
# =====================================================

BASE_URL="http://localhost:3000"

echo "🚀 开始测试 Nomad Agent API 端点..."
echo "================================================"

# 1. 测试健康检查
echo -e "\n🧪 测试健康检查端点"
echo "GET $BASE_URL/api/health"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/health" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 2. 测试城市数据API
echo -e "\n🧪 测试城市数据端点"
echo "GET $BASE_URL/api/cities"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/cities" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 3. 测试数字游民签证API
echo -e "\n🧪 测试数字游民签证端点"
echo "GET $BASE_URL/api/nomad-visas"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/nomad-visas" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 4. 测试数据库连接
echo -e "\n🧪 测试数据库连接"
echo "GET $BASE_URL/api/test-db"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/test-db" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 5. 测试Agent规划API
echo -e "\n🧪 测试Agent规划端点"
echo "POST $BASE_URL/api/agent/plan"

# 创建测试数据文件
cat > test-plan-request.json << 'EOF'
{
  "nationality": "CHN",
  "budget": 2000,
  "duration": 6,
  "startDate": "2024-10-01",
  "preferences": {
    "climate": ["temperate", "mediterranean"],
    "activities": ["coworking", "coffee", "culture"],
    "accommodation": "standard",
    "food": "local",
    "social": "high",
    "visa": "convenient"
  },
  "constraints": {
    "maxCities": 3,
    "minStayDays": 30,
    "maxStayDays": 90,
    "mustVisit": ["Berlin", "Lisbon"],
    "avoidCountries": []
  },
  "userId": null,
  "savePlan": false
}
EOF

curl -s -X POST \
  -H "Content-Type: application/json" \
  -d @test-plan-request.json \
  -w "\n状态码: %{http_code}\n" \
  "$BASE_URL/api/agent/plan" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 清理测试文件
rm -f test-plan-request.json

echo -e "\n🎉 API 测试完成！"
echo "================================================"
