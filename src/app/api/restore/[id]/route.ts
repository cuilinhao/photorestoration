import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/server-translations'

export const dynamic = 'force-dynamic'

const REPLICATE_READ_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_READ_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: getErrorMessage(request, 'error.predictionIdRequired') }, { status: 400 })
    }

    const token = REPLICATE_READ_TOKEN || process.env.REPLICATE_API_TOKEN
    
    if (!token) {
      console.error('Neither REPLICATE_READ_TOKEN nor REPLICATE_API_TOKEN is configured')
      return NextResponse.json({
        error: getErrorMessage(request, 'error.aiServiceNotConfigured')
      }, { status: 500 })
    }
    
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`获取预测状态错误 (${id}):`, response.status, errorText)
      
      let errorMessage = getErrorMessage(request, 'error.getStatusFailed')
      if (response.status === 404) {
        errorMessage = getErrorMessage(request, 'error.taskNotFound')
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('获取预测状态错误:', error)
    return NextResponse.json({ error: getErrorMessage(request, 'error.internalServerError') }, { status: 500 })
  }
} 