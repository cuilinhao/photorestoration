"use client"

import { useState } from "react"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testApiConnection = async () => {
    setIsLoading(true)
    try {
      // 测试创建预测
      const response = await fetch('/api/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          imageUrl: 'https://example.com/test.jpg' 
        })
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        data: data,
        success: response.ok
      })
    } catch (error) {
      setTestResult({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        success: false
      })
    }
    setIsLoading(false)
  }

  const testPolling = async () => {
    if (!testResult?.data?.id) {
      alert('请先测试API连接')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/colorize/${testResult.data.id}`)
      const data = await response.json()
      
      setTestResult((prev: any) => ({
        ...prev,
        pollResult: {
          status: response.status,
          data: data,
          success: response.ok
        }
      }))
    } catch (error) {
      setTestResult((prev: any) => ({
        ...prev,
        pollResult: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          success: false
        }
      }))
    }
    setIsLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">调试页面</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">环境变量检查</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>REPLICATE_API_TOKEN: {process.env.NEXT_PUBLIC_REPLICATE_READ_TOKEN ? '已设置' : '未设置'}</p>
            <p>当前时间: {new Date().toISOString()}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">API 测试</h2>
          <div className="space-x-2">
            <button 
              onClick={testApiConnection}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '测试创建预测'}
            </button>
            
            <button 
              onClick={testPolling}
              disabled={isLoading || !testResult?.data?.id}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '测试轮询'}
            </button>
          </div>
        </div>

        {testResult && (
          <div>
            <h2 className="text-lg font-semibold mb-2">测试结果</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 