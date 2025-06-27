"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, ImageIcon, Lock, Crown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Loader from "./Loader"
import ResultComparison from "./ResultComparison"
import ProgressBar from "./ProgressBar"
import LoginModal from "./LoginModal"
import { useImageRestore } from "@/hooks/useImageRestore"
import { useUser } from "@/contexts/UserContext"

export default function UploadZone() {
  const { status, originalImage, restoredImage, progress, error, processImage, reset, downloadImage } = useImageRestore()
  const { user, canUseService, incrementUsage, getRemainingUses } = useUser()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [language] = useState<'zh' | 'en'>('zh')

  // 文件验证和处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // 检查登录状态
    if (!user) {
      toast.error('请先登录后使用服务')
      setShowLoginModal(true)
      return
    }

    // 检查使用次数
    if (!canUseService()) {
      toast.error('您的免费使用次数已用完，请升级到付费版')
      return
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('请上传 JPG 或 PNG 格式的图片')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片大小不能超过 8MB')
      return
    }

    // 增加使用次数
    incrementUsage()
    processImage(file)
  }, [processImage, user, canUseService, incrementUsage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    disabled: status !== 'idle' || !user || !canUseService()
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
    // 保持在上传区域，不跳转到顶部
  }

  // 错误处理
  if (error) {
    toast.error(error)
  }

  // 成功状态：显示对比结果
  if (status === 'success') {
    return (
      <section id="uploader" className="py-24">
        <div className="container">
          <ResultComparison
            originalImage={originalImage}
            colorizedImage={restoredImage}
            onDownload={handleDownload}
            onTryAgain={handleTryAgain}
          />
        </div>
      </section>
    )
  }

  // 上传界面
  return (
    <>
    <section id="uploader" className="py-24 bg-muted/50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              开始 <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">AI 修复</span>
            </h2>
            <p className="text-muted-foreground lg:text-xl">
              支持 <strong>JPG、PNG</strong> 格式，最大 8MB
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
              ${isDragActive || status !== 'idle'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary hover:bg-primary/5 hover:shadow-lg bg-card'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl opacity-50" />
            
            <div className="relative z-10 space-y-6">
              {/* 上传中 */}
              {status === 'uploading' && (
                <>
                  <div className="flex justify-center">
                    <Loader size={64} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-primary">上传中...</p>
                    <p className="text-muted-foreground">正在上传您的照片</p>
                  </div>
                </>
              )}

              {/* 处理中 */}
              {status === 'processing' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Loader size={48} />
                  </div>
                  <ProgressBar percent={progress} className="mb-6" />
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-primary">AI 修复与上色中...</p>
                    <p className="text-muted-foreground">
                      {progress > 0 ? `正在处理第 ${progress}% 步骤` : '正在初始化 FLUX 模型...'}
                    </p>
                  </div>
                </>
              )}

              {/* 等待上传 */}
              {status === 'idle' && (
                isDragActive ? (
                  <>
                    <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                      <ImageIcon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-primary">
                        松开鼠标上传照片
                      </p>
                      <p className="text-muted-foreground">
                        准备开始 AI 修复之旅
                      </p>
                    </div>
                  </>
                ) : !user ? (
                  // 未登录状态
                  <>
                    <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6">
                      <Lock className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-foreground">
                          请先登录使用 AI 修复服务
                        </p>
                        <p className="text-muted-foreground">
                          登录后可免费使用 <strong>3次</strong> AI 照片修复
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowLoginModal(true)}
                        className="mx-auto"
                      >
                        立即登录
                      </Button>
                    </div>
                  </>
                ) : !canUseService() ? (
                  // 使用次数耗尽状态
                  <>
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                      <Crown className="w-10 h-10 text-yellow-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-foreground">
                          免费使用次数已用完
                        </p>
                        <p className="text-muted-foreground">
                          升级到付费版享受 <strong>无限次数</strong> 修复和优先处理
                        </p>
                      </div>
                      <Button className="mx-auto">
                        <Crown className="w-4 h-4 mr-2" />
                        升级到付费版
                      </Button>
                    </div>
                  </>
                ) : (
                  // 正常上传状态
                  <>
                    <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-primary/10">
                      <Upload className="w-10 h-10 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-foreground">
                          拖拽照片到这里，或点击选择文件
                        </p>
                        <p className="text-muted-foreground">
                          支持 <strong>JPG、PNG</strong> 格式，最大 <strong>8MB</strong>
                        </p>
                        {user && (
                          <p className="text-sm text-primary font-medium">
                            剩余使用次数: {getRemainingUses() === -1 ? '无限制' : `${getRemainingUses()}次`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          ⚡ 60秒快速处理
                        </span>
                        <span className="flex items-center gap-1">
                          🎨 AI 智能上色
                        </span>
                        <span className="flex items-center gap-1">
                          📱 2K 高清输出
                        </span>
                      </div>
                    </div>
                  </>
                )
              )}

              {/* 错误状态 */}
              {status === 'error' && (
                <>
                  <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">❌</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-destructive">处理失败</p>
                    <p className="text-muted-foreground">请检查图片格式并重试</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Login Modal */}
    <LoginModal 
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      language={language}
    />
    </>
  )
}

