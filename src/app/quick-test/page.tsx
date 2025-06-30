"use client"

import { useState } from "react"
import { uploadToStorage } from "@/lib/supabase"
import { createPrediction, getPrediction } from "@/lib/replicate"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuickTest() {
  const [status, setStatus] = useState('')
  const [result, setResult] = useState('')

  const testWithDemoImage = async (imageName: string) => {
    try {
      setStatus(`开始测试 ${imageName}...`)
      setResult('')
      
      // 获取演示图片
      const response = await fetch(`/demo/${imageName}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${imageName}`)
      }
      
      const blob = await response.blob()
      const file = new File([blob], imageName, { type: 'image/jpeg' })
      
      setStatus(`文件信息: ${file.name}, 大小: ${(file.size/1024).toFixed(1)}KB, 类型: ${file.type}`)
      
      // 测试上传到存储
      setStatus('测试上传到存储...')
      const imageUrl = await uploadToStorage(file)
      setStatus(`上传成功: ${imageUrl.substring(0, 60)}...`)
      
      // 测试调用AI API
      setStatus('测试AI处理API...')
      const prediction = await createPrediction(imageUrl)
      setStatus(`AI处理启动成功: ${prediction.id}`)
      
      // 检查AI处理状态
      setStatus('检查AI处理状态...')
      const predictionStatus = await getPrediction(prediction.id)
      
      setResult(`
✅ 完整测试成功！
📄 文件: ${imageName}
📏 大小: ${(file.size/1024).toFixed(1)}KB
🔗 存储URL: ${imageUrl}
🤖 AI预测ID: ${prediction.id}
📊 AI状态: ${predictionStatus.status}
${predictionStatus.logs ? '📋 日志: ' + predictionStatus.logs.substring(0, 100) + '...' : ''}
      `)
      
    } catch (error) {
      console.error('测试失败:', error)
      setStatus(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setResult('')
    }
  }

  const demoImages = [
    '1-0.jpg',
    'old_photo_bw.jpg'
  ]

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">快速功能测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">测试演示图片</h2>
          {demoImages.map((imageName) => (
            <div key={imageName} className="flex items-center gap-3">
              <Button 
                onClick={() => testWithDemoImage(imageName)}
                variant="outline"
                className="flex-1"
              >
                测试 {imageName}
              </Button>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">测试说明：</h3>
            <ul className="text-sm space-y-1">
              <li>• 测试文件格式验证</li>
              <li>• 测试存储上传（Supabase或本地Blob）</li>
              <li>• 测试AI API调用（Replicate）</li>
              <li>• 显示详细的执行步骤和结果</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">测试结果</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-32">
            <div className="mb-4">
              <strong>状态:</strong>
              <div className="mt-1">{status || '等待测试...'}</div>
            </div>
            
            {result && (
              <div>
                <strong>详细结果:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>提示:</strong> 如果存储测试失败但显示"使用本地blob URL"，这是正常的降级机制。</p>
            <p><strong>注意:</strong> AI API需要配置REPLICATE_API_TOKEN才能正常工作。</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">接下来测试主功能:</h3>
        <p className="text-green-700">如果这里的测试都通过了，访问 <Link href="/" className="underline font-medium">首页</Link> 测试完整的上传流程。</p>
      </div>
      
      <div className="mt-4 p-3 bg-blue-100 rounded">
        <p className="text-blue-800 font-medium">
          🎯 现在你可以回到主页 <Link href="/" className="underline">http://localhost:3001</Link> 测试任何图片上传了！
        </p>
      </div>
    </div>
  )
} 