import { NextRequest, NextResponse } from 'next/server'
import { canUseServiceByIP, incrementIPUsage } from '@/lib/usage-limit'
import { getErrorMessage } from '@/lib/server-translations'

export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'
const RESTORE_MODEL_VERSION = process.env.REPLICATE_RESTORE_VERSION || 
  '85ae46551612b8f778348846b6ce1ce1b340e384fe2062399c0c412be29e107d'

export async function POST(request: NextRequest) {
  try {
    // 检查使用限制
    if (!canUseServiceByIP(request)) {
      return NextResponse.json(
        { error: getErrorMessage(request, 'error.dailyLimitReached') },
        { status: 429 }
      )
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: getErrorMessage(request, 'error.imageUrlRequired') }, { status: 400 })
    }

    console.log('🔍 [API] Received image URL type:', imageUrl.substring(0, 50) + '...')

    if (!REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN not configured')
      return NextResponse.json({
        error: getErrorMessage(request, 'error.aiServiceNotConfigured')
      }, { status: 500 })
    }

    // 检查是否为data URL（base64），如果是则直接使用
    let inputImageUrl = imageUrl
    if (imageUrl.startsWith('data:image/')) {
      console.log('✅ [API] Using base64 data URL directly')
      inputImageUrl = imageUrl
    } else if (imageUrl.startsWith('blob:')) {
      console.error('❌ [API] Blob URL not supported by Replicate')
      return NextResponse.json({ 
        error: '图片处理失败：不支持blob类型的URL，请重新上传' 
      }, { status: 400 })
    } else if (!imageUrl.startsWith('http')) {
      console.error('❌ [API] Invalid URL format:', imageUrl.substring(0, 100))
      return NextResponse.json({ 
        error: '图片URL格式无效，请重新上传' 
      }, { status: 400 })
    }

    console.log('🚀 [API] Calling Replicate API with model:', RESTORE_MODEL_VERSION)

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: RESTORE_MODEL_VERSION,
        input: {
          input_image: inputImageUrl,
          output_format: 'jpg'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API 错误:', response.status, errorText)
      
      let errorMessage = getErrorMessage(request, 'error.processingFailed')

      if (response.status === 422) {
        if (errorText.includes('Does not match format')) {
          errorMessage = getErrorMessage(request, 'error.imageUrlFormatError')
        } else {
          errorMessage = getErrorMessage(request, 'error.imageFormatNotSupported')
        }
      } else if (response.status === 500) {
        errorMessage = getErrorMessage(request, 'error.serverError')
      }
      
      return NextResponse.json(
        { error: errorMessage }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API] Prediction created successfully:', data.id)

    // 增加使用次数
    incrementIPUsage(request)

    return NextResponse.json({ id: data.id, status: data.status })

  } catch (error) {
    console.error('处理图片请求错误:', error)
    return NextResponse.json({ error: getErrorMessage(request, 'error.internalServerError') }, { status: 500 })
  }
} 