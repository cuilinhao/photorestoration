"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Loader from "./Loader"
import ResultComparison from "./ResultComparison"
import ProgressBar from "./ProgressBar"
import { useImageRestore } from "@/hooks/useImageRestore"

export default function UploadZone() {
  const { status, originalImage, restoredImage, progress, error, processImage, reset, downloadImage } = useImageRestore()

  // 文件验证和处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('请上传 JPG 或 PNG 格式的图片')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片大小不能超过 8MB')
      return
    }

    processImage(file)
  }, [processImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    disabled: status !== 'idle'
  })

  // 下载处理
  const handleDownload = async () => {
    try {
      await downloadImage()
      toast.success('图片下载成功！')
    } catch (error) {
      toast.error('下载失败，请重试')
    }
  }

  // 重新开始
  const handleTryAgain = () => {
    reset()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 错误处理
  if (error) {
    toast.error(error)
  }

  // 成功状态：显示对比结果
  if (status === 'success') {
    return (
      <div id="uploader" className="py-12 px-6">
        <ResultComparison
          originalImage={originalImage}
          colorizedImage={restoredImage}
          onDownload={handleDownload}
          onTryAgain={handleTryAgain}
        />
      </div>
    )
  }

  // 上传界面
  return (
    <div id="uploader" className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            上传你的老照片
          </h2>
          <p className="text-base text-muted-foreground">
            支持 JPG、PNG 格式，最大 8MB
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragActive || status !== 'idle'
              ? 'border-purple-600 bg-purple-50'
              : 'border-zinc-300 hover:border-purple-600 hover:bg-purple-50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            {/* 上传中 */}
            {status === 'uploading' && (
              <>
                <Loader size={48} />
                <p className="text-lg font-medium text-purple-600">上传中...</p>
                <p className="text-sm text-muted-foreground">正在上传您的照片</p>
              </>
            )}

            {/* 处理中 */}
            {status === 'processing' && (
              <>
                <ProgressBar percent={progress} className="mb-4" />
                <p className="text-lg font-medium text-purple-600">AI 修复与上色中...</p>
                <p className="text-sm text-muted-foreground">
                  {progress > 0 ? `正在处理第 ${progress}% 步骤` : '正在初始化 FLUX 模型...'}
                </p>
              </>
            )}

            {/* 等待上传 */}
            {status === 'idle' && (
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

            {/* 错误状态 */}
            {status === 'error' && (
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

