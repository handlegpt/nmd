'use client'

import { useState } from 'react'

export default function MinimalTestPage() {
  const [count, setCount] = useState(0)

  console.log('🔍 MinimalTestPage rendering, count:', count)

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">最小化测试页面</h1>
      <p>当前计数: {count}</p>
      <button 
        onClick={() => {
          console.log('🔍 Button clicked, current count:', count)
          setCount(c => {
            const newCount = c + 1
            console.log('🔄 State update:', c, '->', newCount)
            return newCount
          })
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        点击我 ({count})
      </button>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">测试说明:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>这个页面只包含最基本的React功能</li>
          <li>没有useEffect，没有复杂的逻辑</li>
          <li>如果这里还有React Error #418，说明问题在全局</li>
          <li>如果这里没有错误，说明问题在某个组件中</li>
        </ul>
      </div>
    </div>
  )
}
