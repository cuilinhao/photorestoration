import { NextRequest, NextResponse } from 'next/server'

// 配置为动态路由，支持服务器端渲染
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'
// flux-kontext-apps/restore-image 最新稳定版本
const RESTORE_MODEL_VERSION = process.env.REPLICATE_RESTORE_VERSION || '85ae46551612b8f778348846b6ce1ce1b340e384fe2062399c0c412be29e107d'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    console.log('🚀 [RESTORE] Creating restoration prediction...')
    console.log('🖼️ [RESTORE] Image URL:', imageUrl)
    console.log('🔧 [RESTORE] Model version:', RESTORE_MODEL_VERSION)

    if (!imageUrl) {
      console.error('❌ [RESTORE] No image URL provided')
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    if (!REPLICATE_API_TOKEN) {
      console.error('❌ [RESTORE] Replicate API token not configured')
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    const requestBody = {
      version: RESTORE_MODEL_VERSION,
      input: {
        input_image: imageUrl,
        output_format: 'jpg', // 输出格式为JPG
        // 其他参数保持默认值，让AI自动优化
      }
    }

    console.log('📝 [RESTORE] Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📨 [RESTORE] Replicate response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [RESTORE] Replicate error:', errorText)
      return NextResponse.json(
        { error: `Replicate API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [RESTORE] Prediction created successfully!')
    console.log('🆔 [RESTORE] Prediction ID:', data.id)
    console.log('📊 [RESTORE] Initial status:', data.status)

    return NextResponse.json({
      id: data.id,
      status: data.status
    })

  } catch (error) {
    console.error('💥 [RESTORE] API error:', error)
    console.error('💥 [RESTORE] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 