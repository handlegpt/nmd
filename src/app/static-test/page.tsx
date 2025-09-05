'use client'

export default function StaticTestPage() {
  console.log('🔍 StaticTestPage rendering - no hooks, no state')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">静态测试页面</h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>测试说明:</strong> 这个页面完全不使用任何React hooks或状态。
          如果这里还有React错误，说明问题在全局或某个Provider中。
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">页面信息</h2>
          <div className="space-y-2">
            <p><strong>渲染时间:</strong> {new Date().toLocaleString()}</p>
            <p><strong>页面类型:</strong> 静态页面（无hooks）</p>
            <p><strong>组件复杂度:</strong> 最低</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="space-y-2">
            <p>如果这个页面没有React错误，说明问题在某个使用了hooks的组件中。</p>
            <p>如果这个页面仍然有React错误，说明问题在全局或某个Provider中。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
