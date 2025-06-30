import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'
const RESTORE_MODEL_VERSION = process.env.REPLICATE_RESTORE_VERSION || 
  '85ae46551612b8f778348846b6ce1ce1b340e384fe2062399c0c412be29e107d'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 })
    }

    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: RESTORE_MODEL_VERSION,
        input: {
          input_image: imageUrl,
          output_format: 'jpg'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API 错误:', response.status, errorText)
      
      let errorMessage = '处理失败，请检查图片格式后重试'
      
      if (response.status === 422) {
        errorMessage = '图片格式不支持，请使用 JPG 或 PNG 格式'
      } else if (response.status === 500) {
        errorMessage = '服务器错误，请稍后重试'
      }
      
      return NextResponse.json(
        { error: errorMessage }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ id: data.id, status: data.status })

  } catch (error) {
    console.error('处理图片请求错误:', error)
    return NextResponse.json({ error: '服务器内部错误，请稍后重试' }, { status: 500 })
  }
} 