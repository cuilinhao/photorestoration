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

    console.log('🔍 [RESTORE] GET /api/restore/[id] called with ID:', id)

    if (!id) {
      console.error('❌ [RESTORE] No prediction ID provided')
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      )
    }

    const token = REPLICATE_READ_TOKEN || process.env.REPLICATE_API_TOKEN!
    console.log('🔑 [RESTORE] Using token:', token ? `${token.slice(0, 8)}...` : 'NOT SET')
    console.log('🌐 [RESTORE] API base URL:', REPLICATE_API_BASE)

    const replicateUrl = `${REPLICATE_API_BASE}/predictions/${id}`
    console.log('📡 [RESTORE] Fetching from Replicate:', replicateUrl)

    const response = await fetch(replicateUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📨 [RESTORE] Replicate response status:', response.status)
    console.log('📨 [RESTORE] Replicate response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [RESTORE] Replicate error response:', errorText)
      return NextResponse.json(
        { error: `Replicate API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('📊 [RESTORE] Full Replicate response:', JSON.stringify(data, null, 2))
    console.log('📊 [RESTORE] Status:', data.status)
    console.log('📊 [RESTORE] Logs length:', data.logs?.length || 0)
    if (data.logs) {
      console.log('📜 [RESTORE] Raw logs preview:', data.logs.slice(-200)) // 最后200字符
    }
    if (data.output) {
      console.log('🎨 [RESTORE] Output URL:', data.output)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('💥 [RESTORE] Get prediction error:', error)
    console.error('💥 [RESTORE] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 