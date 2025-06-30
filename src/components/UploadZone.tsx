"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, ImageIcon, Lock, Crown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Loader from "./Loader"
import ResultComparison from "./ResultComparison"
import ProgressBar from "./ProgressBar"
import AuthModal from "./AuthModal"
import { useImageRestore } from "@/hooks/useImageRestore"
import { useUser } from "@/contexts/UserContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function UploadZone() {
  const { status, originalImage, restoredImage, progress, error, processImage, reset, downloadImage } = useImageRestore()
  const { user, canUseService, incrementUsage, getRemainingUses } = useUser()
  const { language, t } = useLanguage()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 文件验证和处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // 检查登录状态 - 允许游客使用
    if (!user) {
      console.log('🚀 [UPLOAD] Guest user detected, allowing upload with limitations')
      toast.info('游客模式：每日可免费体验2次', {
        position: 'top-center',
        duration: 3000
      })
    } else {
      // 检查使用次数（仅对登录用户）
      if (!canUseService()) {
        toast.error(t('upload.usageExhausted'), {
          position: 'top-center',
          duration: 3000
        })
        return
      }
      // 增加使用次数
      incrementUsage()
    }

    // 调试信息
    console.log('📋 [FILE-CHECK] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // 超宽松的文件检查 - 主要靠扩展名
    const fileName = file.name.toLowerCase()
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    console.log('🔍 [FILE-CHECK] Extension check:', {
      fileName,
      hasValidExtension,
      validExtensions
    })
    
    // 只在明显不是图片时才拒绝
    if (!hasValidExtension && !file.type.startsWith('image/')) {
      toast.error('请上传图片文件（JPG、PNG、WebP 等格式）', {
        position: 'top-center',
        duration: 3000
      })
      return
    }

    // MIME类型检查（超宽松）
    console.log('🔍 [FILE-CHECK] MIME type check:', {
      fileType: file.type,
      startsWithImage: file.type.startsWith('image/'),
      fileName: file.name
    })
    
    // 基本上接受所有图片，只在明显有问题时提醒
    if (file.type && !file.type.startsWith('image/') && !hasValidExtension) {
      toast.warning('文件类型可能不支持，正在尝试处理...', {
        position: 'top-center',
        duration: 2000
      })
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error(t('upload.fileTooLarge'), {
        position: 'top-center',
        duration: 3000
      })
      return
    }

    processImage(file)
  }, [processImage, user, canUseService, incrementUsage, t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // 接受所有图片类型
    },
    multiple: false,
    disabled: status !== 'idle' || (!!user && !canUseService()),
    // 完全不限制文件类型，让我们的自定义验证处理
    validator: undefined
  })

  // 下载处理
  const handleDownload = async () => {
    try {
      await downloadImage()
      toast.success(t('common.downloadSuccess'), {
        position: 'top-center',
        duration: 3000
      })
    } catch (error) {
      toast.error(t('common.downloadFailed'), {
        position: 'top-center',
        duration: 3000
      })
    }
  }

  // 重新开始
  const handleTryAgain = () => {
    reset()
    // 保持在上传区域，不跳转到顶部
  }

  // 错误处理 - 只在状态为error时显示错误
  if (status === 'error' && error) {
    toast.error(error, {
      position: 'top-center',
      duration: 4000
    })
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
              {t('upload.title')} <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">{t('upload.aiRestore')}</span>
            </h2>
            <p className="text-muted-foreground lg:text-xl">
              {t('upload.subtitle')}
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
                    <p className="text-xl font-semibold text-primary">{t('upload.uploading')}</p>
                    <p className="text-muted-foreground">{t('upload.uploadingDesc')}</p>
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
                    <p className="text-xl font-semibold text-primary">{t('upload.processing')}</p>
                    <p className="text-muted-foreground">
                      {progress > 0 ? `${t('upload.processingDesc')} ${progress}% ${t('common.step')}` : t('upload.processingInit')}
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
                        {t('upload.dropHere')}
                      </p>
                      <p className="text-muted-foreground">
                        {t('upload.ready')}
                      </p>
                    </div>
                  </>
                ) : !user ? (
                  // 游客模式状态
                  <>
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-foreground">
                          {t('upload.dragAndDrop')}
                        </p>
                        <p className="text-muted-foreground">
                          游客模式每日可免费体验 <strong>10</strong> 次，登录后可使用 <strong>20</strong> 次
                        </p>
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation() // 阻止事件冒泡到上传区域
                          setShowLoginModal(true)
                        }}
                        variant="outline"
                        className="mx-auto"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        登录获得 20 次使用权限
                      </Button>
                    </div>
                  </>
                ) : !!user && !canUseService() ? (
                  // 使用次数耗尽状态
                  <>
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                      <Crown className="w-10 h-10 text-yellow-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-foreground">
                          {t('upload.usageLimit')}
                        </p>
                        <p className="text-muted-foreground">
                          {t('upload.upgrade')} <strong>{t('upload.unlimited')}</strong> 修复和优先处理
                        </p>
                      </div>
                      <Button 
                        className="mx-auto"
                        onClick={() => {
                          toast.success(t('common.upgradeComingSoon'), {
                            position: 'top-center',
                            duration: 3000
                          })
                        }}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {t('upload.upgradeBtn')}
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
                          {t('upload.dragDrop')}
                        </p>
                        <p className="text-muted-foreground">
                          {t('upload.supportFormat')} <strong>JPG、PNG</strong> {t('upload.maxSize')} <strong>8MB</strong>
                        </p>
                        {user && (
                          <p className="text-sm text-primary font-medium">
                            {t('upload.remainingUses')} {getRemainingUses() === -1 ? t('header.unlimited') : `${getRemainingUses()}${t('upload.times')}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {t('upload.fastProcess')}
                        </span>
                        <span className="flex items-center gap-1">
                          {t('upload.aiColor')}
                        </span>
                        <span className="flex items-center gap-1">
                          {t('upload.hdOutput')}
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
                    <p className="text-xl font-semibold text-destructive">{t('upload.error')}</p>
                    <p className="text-muted-foreground">{t('upload.errorDesc')}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Auth Modal */}
    <AuthModal 
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
    />
    </>
  )
}

