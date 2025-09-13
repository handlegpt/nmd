#!/bin/bash

# =====================================================
# 简化的 API 端点测试脚本（不依赖数据库）
# =====================================================

BASE_URL="http://localhost:3000"

echo "🚀 开始测试 Nomad Agent API 端点（简化版）..."
echo "================================================"

# 1. 测试健康检查
echo -e "\n🧪 测试健康检查端点"
echo "GET $BASE_URL/api/health"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/health" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 2. 测试Agent规划API（修复后的版本）
echo -e "\n🧪 测试Agent规划端点（修复userId问题）"
echo "POST $BASE_URL/api/agent/plan"

# 创建修复后的测试数据文件
cat > test-plan-request-fixed.json << 'EOF'
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
  -d @test-plan-request-fixed.json \
  -w "\n状态码: %{http_code}\n" \
  "$BASE_URL/api/agent/plan" | jq . 2>/dev/null || echo "响应不是JSON格式"

# 清理测试文件
rm -f test-plan-request-fixed.json

# 3. 测试前端页面
echo -e "\n🧪 测试前端页面"
echo "GET $BASE_URL/nomadagent"
curl -s -w "\n状态码: %{http_code}\n" -o /dev/null "$BASE_URL/nomadagent"

echo -e "\n🎉 简化版 API 测试完成！"
echo "================================================"
echo "注意：数据库相关端点需要Supabase环境变量，在服务器上会正常工作"
