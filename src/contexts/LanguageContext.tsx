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
    'upload.freeTrials': '未登录可免费使用',
    'upload.guestTrials': '次，登录后可使用',
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
    'common.step': '步骤',
    
    // Hero Section
    'hero.badge': '🏆 AI 照片修复领域佼佼者',
    'hero.title': '让老照片',
    'hero.titleHighlight': '重获新生',
    'hero.subtitle': '60 秒内让灰阶/褪色照片变 2K 彩照，FLUX AI 智能修复技术让珍贵回忆重新焕发光彩',
    'hero.cta': '🚀 立即开始修复',
    'hero.users': '已有',
    'hero.usersTrust': '用户信赖',
    'hero.dragTip': '👆 拖动滑块查看 AI 修复效果',
    
    // FAQ Section
    'faq.title': '常见问题',
    'faq.subtitle': '为您解答关于 AI 照片修复的疑问',
    
    // Footer
    'footer.slogan': '让每一张珍贵的老照片重新焕发光彩',
    'footer.product': '产品',
    'footer.features': '功能特色',
    'footer.pricing': '价格方案',
    'footer.support': '支持',
    'footer.help': '帮助中心',
    'footer.contact': '联系我们',
    'footer.company': '公司',
    'footer.about': '关于我们',
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.copyright': '© 2024 Photo Restoration. 保留所有权利。',
    
    // Testimonials
    'testimonials.title': '用户好评',
    'testimonials.subtitle': '看看其他用户如何使用 Photo Restoration 修复珍贵回忆',
    
    // FAQ 
    'faq.q1': 'Photo Restoration 支持哪些图片格式？',
    'faq.a1': '我们支持 JPG、JPEG 和 PNG 格式的图片。为了获得最佳效果，建议上传高质量的原图。文件大小限制为 8MB。',
    'faq.q2': 'AI 修复需要多长时间？',
    'faq.a2': '通常只需要 30-90 秒即可完成修复。处理时间取决于图片的复杂程度和服务器负载情况。我们的 FLUX AI 模型经过优化，能够快速处理大多数照片。',
    'faq.q3': '修复效果如何保证？',
    'faq.a3': '我们使用最先进的 FLUX AI 模型，在大量历史照片数据上训练而成。虽然我们努力提供最佳效果，但修复质量可能因原图质量而异。如果不满意，您可以重新上传尝试。',
    'faq.q4': '是否会保存我的照片？',
    'faq.a4': '为了保护您的隐私，我们不会永久保存您上传的照片。处理完成后，您的原图和修复图片会在 24 小时内自动删除。',
    'faq.q5': '免费用户有使用限制吗？',
    'faq.a5': '是的，每个账户每月可免费使用 3 次。如需更多使用次数，请考虑升级到付费计划，享受无限制使用和优先处理。',
    'faq.q6': '如何获得更好的修复效果？',
    'faq.a6': '建议上传清晰度较高的原图，避免过度模糊或损坏严重的照片。如果可能，请确保人脸部分相对清晰，这样 AI 能够更好地进行修复和上色。',
    'faq.moreQuestions': '还有其他问题？',
    'faq.contactSupport': '联系客服',
    
    // Testimonials/Cases
    'cases.title': '真实用户',
    'cases.titleHighlight': '修复案例',
    'cases.subtitle': '看看其他用户使用我们的 FLUX AI 技术修复老照片的神奇效果',
    'cases.before': '📷 修复前',
    'cases.after': '✨ 修复后',
    'cases.beforeLabel': '黑白老照片',
    'cases.afterLabel': 'AI 修复上色',
    'cases.pauseAuto': '⏸️ 暂停自动滚动',
    'cases.startAuto': '▶️ 开启自动滚动',
    'cases.controlTip': '悬停暂停滚动，使用左右箭头键快速浏览，空格键暂停/播放',
    'cases.case1.title': '家庭老照片修复',
    'cases.case1.desc': '30年代老照片重获新生',
    'cases.case1.testimonial': '没想到爷爷的老照片能修复得这么好，细节和色彩都很自然！',
    'cases.case2.title': '人像照片修复',
    'cases.case2.desc': '褪色人像照片完美复原',
    'cases.case2.testimonial': 'AI技术真的很神奇，妈妈年轻时的照片又变得清晰鲜活了。',
    'cases.case3.title': '历史照片修复',
    'cases.case3.desc': '珍贵历史瞬间重现光彩',
    'cases.case3.testimonial': '这张珍贵的历史照片修复后效果超出预期，真的太棒了！',
    'cases.case4.title': '风景照片修复',
    'cases.case4.desc': '老风景照重现昔日风采',
    'cases.case4.testimonial': '童年时拍的风景照修复后色彩丰富，仿佛回到了那个美好的时光。',
    'cases.case5.title': '经典老照片修复',
    'cases.case5.desc': '经典黑白照片完美上色',
    'cases.case5.testimonial': '这种经典的黑白照片修复效果真是令人惊艳，FLUX技术太强大了！',
    
    // Auth Modal
    'auth.signinTitle': '登录 Photo Restoration',
    'auth.signupTitle': '注册 Photo Restoration',
    'auth.signinSubtitle': '登录您的账户开始使用 AI 照片修复服务',
    'auth.signupSubtitle': '创建新账户，享受 AI 照片修复服务',
    'auth.fullNameLabel': '姓名',
    'auth.fullNamePlaceholder': '请输入您的姓名',
    'auth.emailLabel': '邮箱地址',
    'auth.emailPlaceholder': '请输入您的邮箱',
    'auth.passwordLabel': '密码',
    'auth.passwordPlaceholder': '请输入密码（至少6位）',
    'auth.passwordHint': '密码至少需要6个字符',
    'auth.signinButton': '立即登录',
    'auth.signupButton': '创建账户',
    'auth.signinLoading': '登录中...',
    'auth.signupLoading': '注册中...',
    'auth.invalidEmail': '请输入有效的邮箱地址',
    'auth.passwordRequired': '请输入密码',
    'auth.nameRequired': '请输入姓名',
    'auth.signinSuccess': '登录成功！',
    'auth.signupSuccess': '注册成功！您可以立即开始使用了',
    'auth.signinFailed': '登录失败，请检查邮箱和密码',
    'auth.signupFailed': '注册失败，请重试',
    'auth.noAccount': '还没有账户？',
    'auth.alreadyHaveAccount': '已有账户？',
    'auth.signinLink': '立即登录',
    'auth.signupLink': '免费注册',
    'auth.freeFeatures': '免费用户权益',
    'auth.feature1': '每日 20 次免费修复',
    'auth.feature2': '高质量 AI 修复',
    'auth.feature3': '2K 高清输出',
    'auth.premiumFeatures': '付费用户额外权益',
    'auth.premiumFeature1': '无限次数修复',
    'auth.premiumFeature2': '优先处理队列',
    'auth.premiumFeature3': '批量处理功能',
    'auth.upgradeButton': '升级到付费版'
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
    'upload.guestTrials': 'free tries as guest, or',
    'upload.loggedInTrials': 'tries after login',
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
    'common.step': '',
    
    // Hero Section
    'hero.badge': '🏆 Leading AI Photo Restoration',
    'hero.title': 'Bring Old Photos',
    'hero.titleHighlight': ' Back to Life',
    'hero.subtitle': 'Transform grayscale/faded photos into 2K color images in 60 seconds. FLUX AI technology brings precious memories back to vibrant life',
    'hero.cta': '🚀 Start Restoration Now',
    'hero.users': 'Trusted by',
    'hero.usersTrust': 'users',
    'hero.dragTip': '👆 Drag slider to see AI restoration effect',
    
    // FAQ Section
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Answers to your questions about AI photo restoration',
    
    // Footer
    'footer.slogan': 'Bringing every precious old photo back to vibrant life',
    'footer.product': 'Product',
    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.support': 'Support',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.company': 'Company',
    'footer.about': 'About Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2024 Photo Restoration. All rights reserved.',
    
    // Testimonials
    'testimonials.title': 'User Reviews',
    'testimonials.subtitle': 'See how other users restore precious memories with Photo Restoration',
    
    // FAQ
    'faq.q1': 'What image formats does Photo Restoration support?',
    'faq.a1': 'We support JPG, JPEG, and PNG formats. For best results, we recommend uploading high-quality original images. File size limit is 8MB.',
    'faq.q2': 'How long does AI restoration take?',
    'faq.a2': 'Usually takes only 30-90 seconds to complete restoration. Processing time depends on image complexity and server load. Our FLUX AI model is optimized for fast processing of most photos.',
    'faq.q3': 'How is the restoration quality guaranteed?',
    'faq.a3': 'We use the state-of-the-art FLUX AI model trained on large amounts of historical photo data. While we strive to provide the best results, restoration quality may vary based on original image quality. You can re-upload and try again if unsatisfied.',
    'faq.q4': 'Do you save my photos?',
    'faq.a4': 'To protect your privacy, we don\'t permanently store your uploaded photos. After processing, both your original and restored images are automatically deleted within 24 hours.',
    'faq.q5': 'Are there usage limits for free users?',
    'faq.a5': 'Yes, each account can use the service 3 times per month for free. For more usage, please consider upgrading to a paid plan for unlimited use and priority processing.',
    'faq.q6': 'How to get better restoration results?',
    'faq.a6': 'We recommend uploading high-resolution original images, avoiding overly blurry or severely damaged photos. If possible, ensure facial areas are relatively clear so AI can better perform restoration and colorization.',
    'faq.moreQuestions': 'Have more questions?',
    'faq.contactSupport': 'Contact Support',
    
    // Testimonials/Cases
    'cases.title': 'Real User',
    'cases.titleHighlight': 'Restoration Cases',
    'cases.subtitle': 'See the amazing effects of other users using our FLUX AI technology to restore old photos',
    'cases.before': '📷 Before',
    'cases.after': '✨ After',
    'cases.beforeLabel': 'B&W Old Photo',
    'cases.afterLabel': 'AI Restored',
    'cases.pauseAuto': '⏸️ Pause Auto Scroll',
    'cases.startAuto': '▶️ Start Auto Scroll',
    'cases.controlTip': 'Hover to pause scrolling, use arrow keys to browse, spacebar to pause/play',
    'cases.case1.title': 'Family Photo Restoration',
    'cases.case1.desc': '1930s old photo brought back to life',
    'cases.case1.testimonial': 'Never expected grandpa\'s old photo could be restored so well, the details and colors look so natural!',
    'cases.case2.title': 'Portrait Restoration',
    'cases.case2.desc': 'Faded portrait perfectly restored',
    'cases.case2.testimonial': 'AI technology is truly amazing, mom\'s young photo has become clear and vibrant again.',
    'cases.case3.title': 'Historical Photo Restoration',
    'cases.case3.desc': 'Precious historical moments shine again',
    'cases.case3.testimonial': 'This precious historical photo exceeded expectations after restoration, it\'s absolutely amazing!',
    'cases.case4.title': 'Landscape Photo Restoration',
    'cases.case4.desc': 'Old landscape photos regain former glory',
    'cases.case4.testimonial': 'The landscape photo from childhood has rich colors after restoration, as if returning to those beautiful times.',
    'cases.case5.title': 'Classic Photo Restoration',
    'cases.case5.desc': 'Classic B&W photo perfectly colorized',
    'cases.case5.testimonial': 'The restoration effect of this classic black and white photo is truly stunning, FLUX technology is so powerful!',
    
    // Auth Modal
    'auth.signinTitle': 'Sign In to Photo Restoration',
    'auth.signupTitle': 'Sign Up for Photo Restoration',
    'auth.signinSubtitle': 'Sign in to your account to start using AI photo restoration service',
    'auth.signupSubtitle': 'Create a new account to enjoy AI photo restoration service',
    'auth.fullNameLabel': 'Full Name',
    'auth.fullNamePlaceholder': 'Enter your full name',
    'auth.emailLabel': 'Email Address',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Enter password (at least 6 characters)',
    'auth.passwordHint': 'Password must be at least 6 characters',
    'auth.signinButton': 'Sign In',
    'auth.signupButton': 'Create Account',
    'auth.signinLoading': 'Signing in...',
    'auth.signupLoading': 'Creating account...',
    'auth.invalidEmail': 'Please enter a valid email address',
    'auth.passwordRequired': 'Please enter a password',
    'auth.nameRequired': 'Please enter your name',
    'auth.signinSuccess': 'Sign in successful!',
    'auth.signupSuccess': 'Account created! Please check your email for verification',
    'auth.signinFailed': 'Sign in failed, please check email and password',
    'auth.signupFailed': 'Sign up failed, please try again',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signinLink': 'Sign In',
    'auth.signupLink': 'Sign Up Free',
    'auth.freeFeatures': 'Free User Benefits',
    'auth.feature1': '20 free restorations per day',
    'auth.feature2': 'High-quality AI restoration',
    'auth.feature3': '2K HD output',
    'auth.premiumFeatures': 'Premium User Benefits',
    'auth.premiumFeature1': 'Unlimited restorations',
    'auth.premiumFeature2': 'Priority processing',
    'auth.premiumFeature3': 'Batch processing',
    'auth.upgradeButton': 'Upgrade to Premium'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('photo_restoration_language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    } else {
      // 如果没有保存的语言设置，默认设置为英文
      setLanguage('en')
      localStorage.setItem('photo_restoration_language', 'en')
    }
  }, [])

  // 保存语言设置到 localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('photo_restoration_language', lang)
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