"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻译文本数据
const translations = {
  zh: {
    // Header 相关
    'nav.features': '功能特色',
    'nav.showcase': '案例展示',
    'nav.getStarted': '开始使用',
    'nav.faq': '常见问题',
    'header.signIn': '登录',
    'header.signOut': '登出',
    'header.unlimited': '无限制',
    'header.timesLeft': '次',
    'header.usage': '使用次数',
    'header.darkMode': '深色模式',
    'header.language': '语言',
    'header.chinese': '中文',
    
    // Feature Section
    'features.title': '为什么选择',
    'features.subtitle': '专业的 AI 照片修复技术，让每一张珍贵的老照片都能重新绽放光彩',
    'features.aiRestore.title': 'AI 智能修复',
    'features.aiRestore.desc': '采用最新 FLUX AI 模型，智能识别并修复老照片中的损伤、划痕和污渍',
    'features.oneClickColor.title': '一键上色',
    'features.oneClickColor.desc': '60秒内将黑白照片变成生动的彩色照片，让回忆重新焕发光彩',
    'features.hdRestore.title': '高清还原',
    'features.hdRestore.desc': '输出2K高清画质，细节丰富，让老照片重获新生',
    'features.easyToUse.title': '简单易用',
    'features.easyToUse.desc': '拖拽上传即可开始处理，无需复杂操作，一键下载处理结果',
    
    // Upload Zone
    'upload.title': '开始',
    'upload.aiRestore': 'AI 修复',
    'upload.subtitle': '支持 JPG、PNG 格式，最大 8MB',
    'upload.pleaseLogin': '请先登录后使用服务',
    'upload.usageExhausted': '您的免费使用次数已用完，请升级到付费版',
    'upload.invalidFormat': '请上传 JPG 或 PNG 格式的图片',
    'upload.fileTooLarge': '图片大小不能超过 8MB',
    'upload.uploading': '上传中...',
    'upload.uploadingDesc': '正在上传您的照片',
    'upload.processing': 'AI 修复与上色中...',
    'upload.processingDesc': '正在处理第',
    'upload.processingInit': '正在初始化 FLUX 模型...',
    'upload.dropHere': '松开鼠标上传照片',
    'upload.ready': '准备开始 AI 修复之旅',
    'upload.loginRequired': '请先登录使用 AI 修复服务',
    'upload.freeTrials': '登录后可免费使用',
    'upload.times': '次',
    'upload.login': '立即登录',
    'upload.usageLimit': '免费使用次数已用完',
    'upload.upgrade': '升级到付费版享受',
    'upload.unlimited': '无限次数',
    'upload.upgradeBtn': '升级到付费版',
    'upload.dragDrop': '拖拽照片到这里，或点击选择文件',
    'upload.supportFormat': '支持',
    'upload.maxSize': '格式，最大',
    'upload.remainingUses': '剩余使用次数:',
    'upload.fastProcess': '60秒快速处理',
    'upload.aiColor': 'AI 智能上色',
    'upload.hdOutput': '2K 高清输出',
    'upload.error': '处理失败',
    'upload.errorDesc': '请检查图片格式并重试',
    
    // Result Comparison
    'result.sideBySide': '并排对比',
    'result.slider': '滑块对比',
    'result.original': '原始照片',
    'result.aiResult': 'AI 上色结果',
    'result.blackWhite': '黑白老照片',
    'result.colorRestored': '彩色复原照片',
    'result.dragSlider': '拖动滑块查看前后对比效果',
    'result.download': '下载彩色照片',
    'result.tryAgain': '上传新照片',
    'result.completed': '🎉 AI 修复与上色完成！',
    'result.sideBySeideDesc': '左右对比查看修复与上色效果，可以清楚看到照片的品质提升和色彩变化。FLUX 技术智能修复损坏并还原自然色彩。',
    'result.sliderDesc': '拖动滑块查看前后对比效果，体验 FLUX AI 修复与上色技术的神奇魅力。',
    'result.smartRestore': '智能修复',
    'result.hdColor': '高清上色',
    'result.fluxPowered': 'FLUX 驱动',
    
    // Common
    'common.downloadSuccess': '图片下载成功！',
    'common.downloadFailed': '下载失败，请重试',
    'common.upgradeComingSoon': '升级功能开发中，敬请期待！',
    'common.step': '步骤'
  },
  en: {
    // Header 相关
    'nav.features': 'Features',
    'nav.showcase': 'Showcase',
    'nav.getStarted': 'Get Started',
    'nav.faq': 'FAQ',
    'header.signIn': 'Sign In',
    'header.signOut': 'Sign Out',
    'header.unlimited': 'Unlimited',
    'header.timesLeft': ' left',
    'header.usage': 'Usage',
    'header.darkMode': 'Dark Mode',
    'header.language': 'Language',
    'header.chinese': 'English',
    
    // Feature Section
    'features.title': 'Why Choose',
    'features.subtitle': 'Professional AI photo restoration technology that brings every precious old photo back to life',
    'features.aiRestore.title': 'AI Smart Restoration',
    'features.aiRestore.desc': 'Using the latest FLUX AI model to intelligently identify and repair damage, scratches and stains in old photos',
    'features.oneClickColor.title': 'One-Click Colorization',
    'features.oneClickColor.desc': 'Transform black and white photos into vivid color photos in 60 seconds, bringing memories back to life',
    'features.hdRestore.title': 'HD Restoration',
    'features.hdRestore.desc': 'Output 2K high-definition quality with rich details, giving old photos a new lease of life',
    'features.easyToUse.title': 'Easy to Use',
    'features.easyToUse.desc': 'Drag and drop to upload and start processing, no complex operations, one-click download results',
    
    // Upload Zone
    'upload.title': 'Start',
    'upload.aiRestore': 'AI Restoration',
    'upload.subtitle': 'Supports JPG, PNG formats, max 8MB',
    'upload.pleaseLogin': 'Please login first to use the service',
    'upload.usageExhausted': 'Your free usage limit has been reached, please upgrade to premium',
    'upload.invalidFormat': 'Please upload JPG or PNG format images',
    'upload.fileTooLarge': 'Image size cannot exceed 8MB',
    'upload.uploading': 'Uploading...',
    'upload.uploadingDesc': 'Uploading your photo',
    'upload.processing': 'AI Restoration & Colorization in progress...',
    'upload.processingDesc': 'Processing step',
    'upload.processingInit': 'Initializing FLUX model...',
    'upload.dropHere': 'Release to upload photo',
    'upload.ready': 'Ready to start AI restoration journey',
    'upload.loginRequired': 'Please login first to use AI restoration service',
    'upload.freeTrials': 'Get',
    'upload.times': 'free restorations after login',
    'upload.login': 'Login Now',
    'upload.usageLimit': 'Free usage limit reached',
    'upload.upgrade': 'Upgrade to premium for',
    'upload.unlimited': 'unlimited',
    'upload.upgradeBtn': 'Upgrade to Premium',
    'upload.dragDrop': 'Drag photos here, or click to select files',
    'upload.supportFormat': 'Supports',
    'upload.maxSize': 'formats, max',
    'upload.remainingUses': 'Remaining uses:',
    'upload.fastProcess': '⚡ 60s Fast Processing',
    'upload.aiColor': '🎨 AI Smart Coloring',
    'upload.hdOutput': '📱 2K HD Output',
    'upload.error': 'Processing Failed',
    'upload.errorDesc': 'Please check image format and try again',
    
    // Result Comparison
    'result.sideBySide': 'Side by Side',
    'result.slider': 'Slider Compare',
    'result.original': '📷 Original Photo',
    'result.aiResult': '✨ AI Colorization Result',
    'result.blackWhite': 'Black & White Photo',
    'result.colorRestored': 'Color Restored Photo',
    'result.dragSlider': 'Drag slider to see before and after comparison',
    'result.download': 'Download Color Photo',
    'result.tryAgain': 'Upload New Photo',
    'result.completed': '🎉 AI Restoration & Colorization Complete!',
    'result.sideBySeideDesc': 'Side-by-side comparison shows restoration and colorization effects clearly, revealing quality improvements and color changes. FLUX technology intelligently repairs damage and restores natural colors.',
    'result.sliderDesc': 'Drag the slider to see before and after effects, experience the magic of FLUX AI restoration and colorization technology.',
    'result.smartRestore': 'Smart Restoration',
    'result.hdColor': 'HD Colorization',
    'result.fluxPowered': 'FLUX Powered',
    
    // Common
    'common.downloadSuccess': 'Image downloaded successfully!',
    'common.downloadFailed': 'Download failed, please try again',
    'common.upgradeComingSoon': 'Upgrade feature coming soon!',
    'common.step': ''
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('colorold_language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // 保存语言设置到 localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('colorold_language', lang)
  }

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}