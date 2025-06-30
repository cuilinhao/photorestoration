"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"

export default function DebugUpload() {
  const [fileInfo, setFileInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    addLog(`接收到 ${acceptedFiles.length} 个文件，拒绝 ${rejectedFiles.length} 个文件`)
    
    if (rejectedFiles.length > 0) {
      addLog(`拒绝的文件: ${JSON.stringify(rejectedFiles.map(f => ({
        name: f.file.name,
        type: f.file.type,
        errors: f.errors.map((e: any) => e.message)
      })))}`)
    }

    const file = acceptedFiles[0]
    if (!file) {
      addLog('没有有效文件')
      return
    }

    addLog(`处理文件: ${file.name}`)
    
    const info = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
      extension: file.name.toLowerCase().substring(file.name.lastIndexOf('.')),
    }
    
    setFileInfo(info)
    addLog(`文件信息: ${JSON.stringify(info, null, 2)}`)

    // 文件扩展名检查
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const isValidExtension = validExtensions.includes(info.extension)
    addLog(`扩展名检查: ${info.extension} -> ${isValidExtension ? '✅ 有效' : '❌ 无效'}`)

    // MIME类型检查
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const isValidMime = validTypes.includes(file.type)
    const isImageMime = file.type.startsWith('image/')
    addLog(`MIME类型检查: ${file.type} -> 精确匹配: ${isValidMime ? '✅' : '❌'}, 图片类型: ${isImageMime ? '✅' : '❌'}`)

    // 文件大小检查
    const maxSize = 8 * 1024 * 1024 // 8MB
    const isValidSize = file.size <= maxSize
    addLog(`文件大小检查: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${isValidSize ? '✅ 有效' : '❌ 过大'}`)

    // 模拟验证结果
    const wouldPass = isValidExtension && (isValidMime || isImageMime) && isValidSize
    addLog(`🎯 最终结果: ${wouldPass ? '✅ 应该通过验证' : '❌ 会被拒绝'}`)

  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // 不设置任何限制，接受所有文件来调试
    multiple: false
  })

  const clearLogs = () => {
    setLogs([])
    setFileInfo(null)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">文件上传调试工具</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 上传区域 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">上传测试</h2>
          
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-600">放开鼠标释放文件...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">拖拽文件到这里，或点击选择文件</p>
                <p className="text-sm text-gray-500">所有文件类型都会被接受用于调试</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={clearLogs} variant="outline">
              清除日志
            </Button>
          </div>

          {/* 文件信息 */}
          {fileInfo && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">文件详细信息</h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(fileInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 日志区域 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">调试日志</h2>
          
          <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">等待文件上传...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 说明文档 */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">如何使用此工具：</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>上传你遇到问题的图片文件</li>
          <li>查看右侧的调试日志，了解文件被如何处理</li>
          <li>如果显示"会被拒绝"，查看具体的检查项目</li>
          <li>如果所有检查都通过但仍然报错，问题可能在后端API</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm">
            <strong>提示：</strong> 如果你的图片在这里显示"应该通过验证"但在实际使用中仍然报错，
            说明问题可能出现在AI处理服务（Replicate API）那里，而不是文件验证。
          </p>
        </div>
      </div>
    </div>
  )
} 