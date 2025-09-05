'use client'

export default function TestNoProvidersPage() {
  console.log('🔍 TestNoProvidersPage rendering - no providers, no context')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">无Provider测试页面</h1>
        
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <strong>测试说明:</strong> 这个页面不使用任何Provider或Context。
          如果这里还有React错误，说明问题在React本身或某个全局组件中。
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">页面信息</h2>
          <div className="space-y-2">
            <p><strong>渲染时间:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Provider:</strong> 无</p>
            <p><strong>Context:</strong> 无</p>
            <p><strong>Hooks:</strong> 无</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="space-y-2">
            <p>如果这个页面没有React错误，说明问题在某个Provider或Context中。</p>
            <p>如果这个页面仍然有React错误，说明问题在React本身或某个全局组件中。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
