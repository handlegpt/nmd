// =====================================================
// Nomad Agent API 端点测试脚本
// =====================================================

const BASE_URL = 'http://localhost:3000'; // 本地开发服务器

// 测试数据
const testPlanRequest = {
  nationality: 'CHN',
  budget: 2000,
  duration: 6,
  startDate: '2024-10-01',
  preferences: {
    climate: ['temperate', 'mediterranean'],
    activities: ['coworking', 'coffee', 'culture'],
    accommodation: 'standard',
    food: 'local',
    social: 'high',
    visa: 'convenient'
  },
  constraints: {
    maxCities: 3,
    minStayDays: 30,
    maxStayDays: 90,
    mustVisit: ['Berlin', 'Lisbon'],
    avoidCountries: []
  },
  userId: null,
  savePlan: false
};

// 测试函数
async function testAPIEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🧪 测试 ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 响应数据:`, JSON.stringify(result, null, 2));
    
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    console.log(`❌ 错误:`, error.message);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试 Nomad Agent API 端点...\n');
  
  // 1. 测试健康检查
  await testAPIEndpoint('/api/health');
  
  // 2. 测试城市数据API
  await testAPIEndpoint('/api/cities');
  
  // 3. 测试数字游民签证API
  await testAPIEndpoint('/api/nomad-visas');
  
  // 4. 测试Agent规划API
  await testAPIEndpoint('/api/agent/plan', 'POST', testPlanRequest);
  
  // 5. 测试数据库连接
  await testAPIEndpoint('/api/test-db');
  
  console.log('\n🎉 API 测试完成！');
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  // 浏览器环境
  runTests();
}

// 导出测试函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAPIEndpoint, runTests, testPlanRequest };
}
