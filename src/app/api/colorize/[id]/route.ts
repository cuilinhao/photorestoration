import { NextRequest, NextResponse } from 'next/server'

// 配置为动态路由，支持服务器端渲染
export const dynamic = 'force-dynamic'

// 这里使用只读 token，可以安全地暴露给前端
const REPLICATE_READ_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_READ_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 要求 await params
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 [API] Getting prediction status for:', id)

    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${REPLICATE_READ_TOKEN || process.env.REPLICATE_API_TOKEN!}`,
        'Content-Type': 'application/json'
      }
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
    console.log('📊 [API] Prediction status:', data.status)

    return NextResponse.json(data)

  } catch (error) {
    console.error('💥 [API] Get prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 