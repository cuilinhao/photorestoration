import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json({ error: 'Prediction ID is required' }, { status: 400 })
    }

    const token = REPLICATE_READ_TOKEN || process.env.REPLICATE_API_TOKEN!
    
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
      
      let errorMessage = '获取处理状态失败，请重试'
      if (response.status === 404) {
        errorMessage = '处理任务不存在或已过期'
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
    return NextResponse.json({ error: '服务器内部错误，请稍后重试' }, { status: 500 })
  }
} 