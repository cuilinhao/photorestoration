"use client"

import { useState } from "react"
import { createPrediction, getPrediction } from "@/lib/replicate"
import { parseDeoldifyPercent } from "@/lib/parse-log"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [status, setStatus] = useState<string>('ready')
  const [result, setResult] = useState<{
    type: 'create' | 'get' | 'parse' | 'error' | 'download'
    data?: unknown
    error?: string
  } | null>(null)

  const testAPI = async () => {
    setStatus('testing...')
    try {
      // 测试创建预测
      const prediction = await createPrediction('https://example.com/test.jpg')
      setResult({ type: 'create', data: prediction })
      setStatus('success')
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      setStatus('error')
    }
  }

  const testPrediction = async () => {
    const testId = 'test-prediction-id'
    setStatus('testing...')
    try {
      const prediction = await getPrediction(testId)
      setResult({ type: 'get', data: prediction })
      setStatus('success')
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      setStatus('error')
    }
  }

  const testParseLog = () => {
    const testLogs = [
      "16/100: 6%|▋     | 6/100 [00:06<01:38,  1.05s/batch]",
      "46/100: 46%|████▌ | 46/100 [00:42<00:49,  1.10batch/s]",
      "Processing 67%",
      "75/100"
    ]

    const results = testLogs.map(log => ({
      log,
      progress: parseDeoldifyPercent(log)
    }))

    setResult({ type: 'parse', data: results })
    setStatus('success')
  }

  // 测试下载功能
  const testDownload = async () => {
    setStatus('testing...')
    try {
      // 使用一个测试图片URL
      const testImageUrl = 'https://replicate.delivery/xezq/Op9pzTCgfNWCX6t8DiJ2thf9bJAYWnRIi08cvfwyLyWfA3qTB/tmp6mx1b6ch.jpg'
      
      const response = await fetch(testImageUrl)
      if (!response.ok) throw new Error('获取图片失败')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test_download_${Date.now()}.jpg`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      setResult({ type: 'download', data: { success: true, message: '下载测试完成' } })
      setStatus('success')
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      setStatus('error')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">API Debug</h1>
      
      <div className="space-y-4 max-w-md mx-auto">
        <Button onClick={testAPI} className="w-full">
          Test Create Prediction
        </Button>
        
        <Button onClick={testPrediction} className="w-full">
          Test Get Prediction
        </Button>
        
        <Button onClick={testParseLog} className="w-full">
          Test Log Parser
        </Button>

        <Button onClick={testDownload} className="w-full bg-green-600 hover:bg-green-700">
          Test Download Function
        </Button>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Status: {status}</h3>
          {result && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
} 