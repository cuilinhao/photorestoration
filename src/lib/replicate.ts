// 修改为使用本地 API 路由，避免在前端暴露 API Token
interface PredictionResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  input?: {
    model_name: string
    input_image: string
  }
  output?: string
  error?: string
  logs?: string
  created_at?: string
  urls?: {
    get: string
    cancel: string
  }
}

export async function createPrediction(imageUrl: string): Promise<PredictionResponse> {
  console.log('🚀 [REPLICATE] Creating prediction via API route...')
  console.log('🖼️ [REPLICATE] Image URL:', imageUrl)

  try {
    const response = await fetch('/api/colorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    })

    console.log('📨 [REPLICATE] API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ [REPLICATE] API error:', errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ [REPLICATE] Prediction created successfully!')
    console.log('📊 [REPLICATE] Response data:', data)
    return data

  } catch (error) {
    console.error('💥 [REPLICATE] Create prediction error:', error)
    throw error
  }
}

export async function getPrediction(id: string): Promise<PredictionResponse> {
  console.log('🔍 [REPLICATE] Getting prediction status via API route...')
  console.log('🆔 [REPLICATE] Prediction ID:', id)
  
  try {
    const response = await fetch(`/api/colorize/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('📨 [REPLICATE] API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ [REPLICATE] API error:', errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 [REPLICATE] Prediction status:', data.status)
    return data

  } catch (error) {
    console.error('💥 [REPLICATE] Get prediction error:', error)
    throw error
  }
}

// Poll prediction with timeout and retry logic
export async function pollPrediction(id: string, maxAttempts = 30, intervalSeconds = 3): Promise<PredictionResponse> {
  console.log('⏱️ [REPLICATE] Starting prediction polling...')
  console.log('🔧 [REPLICATE] Poll config:', { id, maxAttempts, intervalSeconds })
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 [REPLICATE] Poll attempt ${attempt}/${maxAttempts}`)
    
    try {
      const prediction = await getPrediction(id)
      
      // Check if prediction is complete
      if (prediction.status === 'succeeded') {
        console.log('🎉 [REPLICATE] Prediction completed successfully!')
        console.log('🖼️ [REPLICATE] Output URL:', prediction.output)
        return prediction
      }
      
      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        console.error('❌ [REPLICATE] Prediction failed!')
        console.error('❌ [REPLICATE] Error details:', prediction.error)
        throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`)
      }
      
      // Still processing, wait and retry
      console.log(`⏳ [REPLICATE] Prediction still ${prediction.status}, waiting ${intervalSeconds}s...`)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
      }
      
    } catch (error) {
      console.error(`💥 [REPLICATE] Poll attempt ${attempt} failed:`, error)
      if (attempt === maxAttempts) {
        throw error
      }
      // Wait before retry on error
      console.log(`🔄 [REPLICATE] Retrying in ${intervalSeconds}s...`)
      await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
    }
  }
  
  console.error('⏰ [REPLICATE] Prediction polling timeout!')
  throw new Error(`Prediction timeout after ${maxAttempts} attempts`)
}
