import { useState } from "react"
import { uploadToStorage } from "@/lib/supabase"
import { createPrediction, getPrediction } from "@/lib/replicate"
import { parseDeoldifyPercent } from "@/lib/parse-log"

// 核心状态类型
interface RestoreState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  originalImage: string
  restoredImage: string
  progress: number
  error: string
}

// 图像压缩工具函数
const compressImage = (file: File, maxSize: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建画布上下文'))
      return
    }
    
    const img = new Image()
    
    img.onload = () => {
      try {
        const { width, height } = img
        
        // 如果图片尺寸已经符合要求，直接返回原文件
        if (width <= maxSize && height <= maxSize) {
          resolve(file)
          return
        }
        
        // 计算压缩比例
        const ratio = Math.min(maxSize / width, maxSize / height)
        canvas.width = Math.floor(width * ratio)
        canvas.height = Math.floor(height * ratio)
        
        // 绘制压缩后的图像
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }))
          } else {
            reject(new Error('图片压缩失败'))
          }
        }, file.type, 0.9)
        
      } catch (error) {
        reject(new Error('图片处理过程中出错'))
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败，请检查图片格式'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export function useImageRestore(language?: string, isLoggedIn?: boolean) {
  const [state, setState] = useState<RestoreState>({
    status: 'idle',
    originalImage: '',
    restoredImage: '',
    progress: 0,
    error: ''
  })

  // 轮询逻辑
  const pollProgress = async (predictionId: string) => {
    const poll = async () => {
      try {
        const result = await getPrediction(predictionId, language, isLoggedIn)
        
        // 更新进度
        const progress = parseDeoldifyPercent(result.logs || '') || state.progress
        setState(prev => ({ ...prev, progress }))
        
        // 检查完成状态
        if (result.status === 'succeeded' && result.output) {
          setState(prev => ({
            ...prev,
            status: 'success' as const,
            restoredImage: result.output as string,
            progress: 100
          }))
          return
        }
        
        if (result.status === 'failed') {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: result.error || '处理失败，请检查图片格式后重试'
          }))
          return
        }
        
        // 继续轮询
        setTimeout(poll, 3000)
      } catch (error) {
        console.error('轮询错误:', error)
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : '网络错误，请重试'
        }))
      }
    }
    
    poll()
  }

  // 主处理函数
  const processImage = async (file: File) => {
    try {
      // 重置状态
      setState({
        status: 'uploading',
        originalImage: '',
        restoredImage: '',
        progress: 0,
        error: ''
      })

      // 压缩并上传
      const compressedFile = await compressImage(file, 2048)
      const imageUrl = await uploadToStorage(compressedFile)
      
      setState(prev => ({
        ...prev,
        status: 'processing',
        originalImage: imageUrl
      }))

      // 创建预测并开始轮询
      const prediction = await createPrediction(imageUrl, language, isLoggedIn)
      pollProgress(prediction.id)

    } catch (error) {
      console.error('处理图片错误:', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : '上传失败，请检查图片格式后重试'
      }))
    }
  }

  // 重置函数
  const reset = () => {
    setState({
      status: 'idle',
      originalImage: '',
      restoredImage: '',
      progress: 0,
      error: ''
    })
  }

  // 下载图片到本地
  const downloadImage = async () => {
    if (!state.restoredImage) return

    try {
      // 获取图片数据
      const response = await fetch(state.restoredImage)
      if (!response.ok) throw new Error('下载失败')
      
      // 转换为blob
      const blob = await response.blob()
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `restored_photo_${Date.now()}.jpg`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理blob URL
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('下载失败:', error)
      throw new Error('下载失败，请重试')
    }
  }

  return {
    ...state,
    processImage,
    reset,
    downloadImage
  }
} 