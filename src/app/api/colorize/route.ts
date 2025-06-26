import { NextRequest, NextResponse } from 'next/server'

// 配置为动态路由，支持服务器端渲染
export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'
const MODEL_VERSION = '0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    const requestBody = {
      version: MODEL_VERSION,
      input: {
        model_name: 'Artistic',
        input_image: imageUrl,
        render_factor: 30  // 降低从默认35到30，加快处理速度，肉眼差别小
      }
    }

    console.log('🚀 [API] Creating Replicate prediction...')
    console.log('🖼️ [API] Image URL:', imageUrl)

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API] Replicate error:', errorText)
      return NextResponse.json(
        { error: `Replicate API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API] Prediction created:', data.id)

    return NextResponse.json({
      id: data.id,
      status: data.status
    })

  } catch (error) {
    console.error('💥 [API] Colorize error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 