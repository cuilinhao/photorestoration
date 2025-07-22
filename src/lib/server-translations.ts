import { NextRequest } from 'next/server'

type Language = 'zh' | 'en'

// 服务器端翻译文本
const serverTranslations = {
  zh: {
    'error.dailyLimitReached': '每日使用次数已达上限，请明天再试',
    'error.imageUrlRequired': '图片URL是必需的',
    'error.replicateNotConfigured': 'Replicate API token 未配置',
    'error.aiServiceNotConfigured': 'AI服务未配置，请检查环境变量',
    'error.processingFailed': '处理失败，请检查图片格式后重试',
    'error.imageUrlFormatError': '图片URL格式错误，请重新上传图片',
    'error.imageFormatNotSupported': '图片格式不支持，请使用 JPG 或 PNG 格式',
    'error.serverError': '服务器错误，请稍后重试',
    'error.internalServerError': '服务器内部错误，请稍后重试',
    'error.predictionIdRequired': '预测ID是必需的',
    'error.getStatusFailed': '获取处理状态失败，请重试',
    'error.taskNotFound': '处理任务不存在或已过期',
    'error.getStatusError': '获取预测状态错误'
  },
  en: {
    'error.dailyLimitReached': 'Daily usage limit reached, please try again tomorrow',
    'error.imageUrlRequired': 'Image URL is required',
    'error.replicateNotConfigured': 'Replicate API token not configured',
    'error.aiServiceNotConfigured': 'AI service not configured, please check environment variables',
    'error.processingFailed': 'Processing failed, please check image format and try again',
    'error.imageUrlFormatError': 'Image URL format error, please re-upload the image',
    'error.imageFormatNotSupported': 'Image format not supported, please use JPG or PNG format',
    'error.serverError': 'Server error, please try again later',
    'error.internalServerError': 'Internal server error, please try again later',
    'error.predictionIdRequired': 'Prediction ID is required',
    'error.getStatusFailed': 'Failed to get processing status, please try again',
    'error.taskNotFound': 'Processing task not found or expired',
    'error.getStatusError': 'Error getting prediction status'
  }
}

/**
 * 从请求中获取语言设置
 */
function getLanguageFromRequest(request: NextRequest): Language {
  // 尝试从 Accept-Language 头部获取语言
  const acceptLanguage = request.headers.get('accept-language')
  
  // 尝试从自定义头部获取语言（前端可以设置）
  const customLanguage = request.headers.get('x-language') as Language
  
  if (customLanguage && (customLanguage === 'zh' || customLanguage === 'en')) {
    return customLanguage
  }
  
  // 从 Accept-Language 头部解析语言
  if (acceptLanguage) {
    if (acceptLanguage.includes('zh')) {
      return 'zh'
    }
    if (acceptLanguage.includes('en')) {
      return 'en'
    }
  }
  
  // 默认返回英文
  return 'en'
}

/**
 * 服务器端翻译函数
 */
export function serverT(request: NextRequest, key: string): string {
  const language = getLanguageFromRequest(request)
  return serverTranslations[language][key as keyof typeof serverTranslations[typeof language]] || key
}

/**
 * 获取多语言错误信息
 */
export function getErrorMessage(request: NextRequest, key: string): string {
  return serverT(request, key)
}
