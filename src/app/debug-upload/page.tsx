"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugUpload() {
  const [fileInfo, setFileInfo] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file: File) => {
    const info = `
📁 文件详情:
• 文件名: ${file.name}
• 文件大小: ${(file.size / 1024).toFixed(1)} KB
• 文件类型: ${file.type}
• 最后修改: ${new Date(file.lastModified).toLocaleString()}

🔍 格式检查:
• 扩展名: ${file.name.substring(file.name.lastIndexOf('.'))}
• MIME 类型: ${file.type}
• 是否为图片: ${file.type.startsWith('image/') ? '✅ 是' : '❌ 否'}

💡 兼容性检查:
• JPG/JPEG: ${/\.(jpe?g)$/i.test(file.name) ? '✅' : '❌'}
• PNG: ${/\.png$/i.test(file.name) ? '✅' : '❌'}
• WebP: ${/\.webp$/i.test(file.name) ? '✅' : '❌'}
• 其他图片格式: ${/\.(gif|bmp|tiff?)$/i.test(file.name) ? '✅' : '❌'}
    `.trim()
    
    setFileInfo(info)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🔧 图片格式调试工具</h1>
        <p className="text-gray-600">上传任何文件，查看详细的格式信息和兼容性检查</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept="*"
            />
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium">拖拽文件到这里，或点击选择</p>
                <p className="text-sm text-gray-500">支持任何格式文件，用于调试检测</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">🎯 调试说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 检查文件的基本信息和格式</li>
              <li>• 验证各种图片格式的兼容性</li>
              <li>• 诊断上传问题的根本原因</li>
              <li>• 测试文件格式检测逻辑</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">📊 文件分析结果</h2>
          
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm min-h-64">
            {fileInfo || (
              <div className="text-gray-500">
                请上传文件开始分析...
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 调试提示:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 如果MIME类型显示为空，可能是文件损坏</li>
              <li>• 扩展名与MIME类型不匹配可能导致验证失败</li>
              <li>• 某些图片编辑软件可能改变文件的MIME类型</li>
              <li>• 重命名文件扩展名不会改变实际格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 