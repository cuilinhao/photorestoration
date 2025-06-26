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
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
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
      const error = await response.text()
      return NextResponse.json(
        { error: `API error: ${response.status}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ id: data.id, status: data.status })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 