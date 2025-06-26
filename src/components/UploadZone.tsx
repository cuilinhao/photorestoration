"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Loader from "./Loader"
import ResultSlider from "./ResultSlider"
import ResultComparison from "./ResultComparison"
import ProgressBar from "./ProgressBar"
import { uploadToStorage } from "@/lib/supabase"
import { createPrediction, getPrediction } from "@/lib/replicate"
import { useReplicateProgress } from "@/hooks/useReplicateProgress"

type UploadState = 'idle' | 'uploading' | 'predicting' | 'success' | 'fail'

// 图片压缩函数，确保长边不超过指定尺寸
const compressImage = (file: File, maxSize: number): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      
      // 如果图片已经足够小，直接返回原文件
      if (width <= maxSize && height <= maxSize) {
        resolve(file)
        return
      }
      
      // 计算新尺寸，保持宽高比
      const ratio = Math.min(maxSize / width, maxSize / height)
      const newWidth = Math.floor(width * ratio)
      const newHeight = Math.floor(height * ratio)
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // 转换为blob，保持较高质量
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          console.log(`🖼️ [COMPRESS] ${width}x${height} → ${newWidth}x${newHeight} (${(file.size/1024/1024).toFixed(1)}MB → ${(compressedFile.size/1024/1024).toFixed(1)}MB)`)
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, file.type, 0.9) // 90% 质量
    }
    
    img.src = URL.createObjectURL(file)
  })
}

interface PredictionResult {
  status: string
  output?: string
}

export default function UploadZone() {
  const [state, setState] = useState<UploadState>('idle')
  const [originalImage, setOriginalImage] = useState<string>('')
  const [colorizedImage, setColorizedImage] = useState<string>('')
  const [predictionId, setPredictionId] = useState<string | null>(null)

  console.log('🎯 [UPLOAD] UploadZone render, state:', state, 'predictionId:', predictionId)

  // 使用新的进度Hook
  const { percent, status } = useReplicateProgress(predictionId)
  
  console.log('📊 [UPLOAD] Progress Hook result - percent:', percent, 'status:', status)

  // 监听状态变化，自动更新UI状态
  useEffect(() => {
    if (predictionId && status === 'succeeded') {
      // 获取最终结果
      getPrediction(predictionId).then((result) => {
        if (result.output) {
          setColorizedImage(result.output)
          setState('success')
          toast.success('AI 修复与上色完成！')
        }
      }).catch(() => {
        setState('fail')
        toast.error('获取结果失败')
      })
    } else if (predictionId && (status === 'failed' || status === 'canceled')) {
      setState('fail')
      toast.error('处理失败，请重试')
      setTimeout(() => setState('idle'), 3000)
    }
  }, [predictionId, status])

  const processFile = useCallback(async (file: File) => {
    try {
      console.log('🚀 [UPLOAD] Starting processFile with file:', file.name, file.size, 'bytes')
      setState('uploading')

      // 压缩图片以确保长边 ≤ 2048px，提高处理速度
      console.log('🖼️ [UPLOAD] Compressing image...')
      const compressedFile = await compressImage(file, 2048)
      console.log('✅ [UPLOAD] Image compressed:', compressedFile.size, 'bytes')
      
      // Upload to storage (stub)
      console.log('☁️ [UPLOAD] Uploading to storage...')
      const uploadedUrl = await uploadToStorage(compressedFile)
      console.log('✅ [UPLOAD] Upload complete, URL:', uploadedUrl)
      setOriginalImage(uploadedUrl)

      console.log('🎯 [UPLOAD] Switching to predicting state...')
      setState('predicting')

      // Create prediction
              console.log('🤖 [UPLOAD] Creating Replicate restoration prediction...')
        const prediction = await createPrediction(uploadedUrl)
        console.log('✅ [UPLOAD] Restoration prediction created successfully!')
        console.log('🆔 [UPLOAD] Prediction ID:', prediction.id)
        console.log('📊 [UPLOAD] Full prediction response:', JSON.stringify(prediction, null, 2))
      
      console.log('💾 [UPLOAD] Setting predictionId state...')
      setPredictionId(prediction.id)
      console.log('✅ [UPLOAD] PredictionId state set, Hook should start polling now')

      // 现在进度Hook会自动开始轮询

    } catch (error) {
      console.error('💥 [UPLOAD] Processing error:', error)
      console.error('💥 [UPLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack')
      setState('fail')
      toast.error('处理失败，请重试')
      setTimeout(() => setState('idle'), 3000)
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('请上传 JPG 或 PNG 格式的图片')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片大小不能超过 8MB')
      return
    }

    processFile(file)
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    disabled: state !== 'idle'
  })

  const handleDownload = () => {
    if (colorizedImage) {
      const link = document.createElement('a')
      link.href = colorizedImage
      link.download = 'colorized_photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('图片下载成功！')
    }
  }

  const handleTryAgain = () => {
    setState('idle')
    setOriginalImage('')
    setColorizedImage('')
    setPredictionId(null)

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (state === 'success') {
    return (
      <div id="uploader" className="py-16 px-6">
        <ResultComparison
          originalImage={originalImage}
          colorizedImage={colorizedImage}
          onDownload={handleDownload}
          onTryAgain={handleTryAgain}
        />
      </div>
    )
  }

  return (
    <div id="uploader" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            上传你的老照片
          </h2>
          <p className="text-lg text-muted-foreground">
            支持 JPG、PNG 格式，最大 8MB
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragActive || state !== 'idle'
              ? 'border-purple-600 bg-purple-50'
              : 'border-zinc-300 hover:border-purple-600 hover:bg-purple-50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            {state === 'uploading' && (
              <>
                <Loader size={48} />
                <p className="text-lg font-medium text-purple-600">上传中...</p>
                <p className="text-sm text-muted-foreground">正在上传您的照片</p>
              </>
            )}

            {state === 'predicting' && (
              <>
                <ProgressBar percent={percent} className="mb-4" />
                <p className="text-lg font-medium text-purple-600">AI 修复与上色中...</p>
                <p className="text-sm text-muted-foreground">
                  {percent > 0 ? `正在处理第 ${percent}% 步骤` : '正在初始化 FLUX 模型...'}
                </p>
              </>
            )}

            {state === 'idle' && (
              isDragActive ? (
                <>
                  <ImageIcon className="w-16 h-16 mx-auto text-purple-600" />
                  <p className="text-lg font-medium text-purple-600">
                    松开鼠标上传照片
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">
                    拖拽照片到这里，或点击选择文件
                  </p>
                  <p className="text-sm text-muted-foreground">
                    支持 JPG、PNG 格式，最大 8MB
                  </p>
                </>
              )
            )}

            {state === 'fail' && (
              <>
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-lg font-medium text-red-600">处理失败</p>
                <p className="text-sm text-muted-foreground">请检查图片格式并重试</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
