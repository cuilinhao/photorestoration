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

// Poll prediction with timeout and retry logic (方案A: 加长重试时间)
export async function pollPrediction(id: string, maxAttempts = 60, intervalSeconds = 2.5): Promise<PredictionResponse> {
  console.log('⏱️ [REPLICATE] Starting prediction polling...')
  console.log('🔧 [REPLICATE] Poll config:', { id, maxAttempts, intervalSeconds })
  console.log('⏰ [REPLICATE] Max wait time: ~', Math.ceil(maxAttempts * intervalSeconds), 'seconds')
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 [REPLICATE] Poll attempt ${attempt}/${maxAttempts}`)
    
    try {
      const prediction = await getPrediction(id)
      
      // 改善调试：显示更多状态信息
      console.log(`📊 [REPLICATE] Status: ${prediction.status}`)
      if (prediction.error) {
        console.log(`⚠️ [REPLICATE] Error details:`, prediction.error)
      }
      
      // Check if prediction is complete
      if (prediction.status === 'succeeded') {
        console.log('🎉 [REPLICATE] Prediction completed successfully!')
        console.log('🖼️ [REPLICATE] Output URL:', prediction.output)
        return prediction
      }
      
      // 明确区分失败状态，避免混淆
      if (prediction.status === 'failed') {
        console.error('❌ [REPLICATE] Prediction failed!')
        console.error('❌ [REPLICATE] Error details:', prediction.error)
        throw new Error(`Prediction failed: ${prediction.error || 'Unknown error from Replicate'}`)
      }
      
      if (prediction.status === 'canceled') {
        console.error('🚫 [REPLICATE] Prediction was canceled!')
        throw new Error(`Prediction was canceled: ${prediction.error || 'Canceled by user or system'}`)
      }
      
      // Still processing, wait and retry
      console.log(`⏳ [REPLICATE] Prediction still ${prediction.status}, waiting ${intervalSeconds}s...`)
      console.log(`⏱️ [REPLICATE] Elapsed time: ~${Math.ceil(attempt * intervalSeconds)}s / ~${Math.ceil(maxAttempts * intervalSeconds)}s`)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
      }
      
    } catch (error) {
      // 如果是我们明确抛出的错误（failed/canceled），直接重新抛出
      if (error instanceof Error && (error.message.includes('failed') || error.message.includes('canceled'))) {
        throw error
      }
      
      console.error(`💥 [REPLICATE] Poll attempt ${attempt} failed:`, error)
      if (attempt === maxAttempts) {
        throw new Error(`Polling failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      // Wait before retry on network error
      console.log(`🔄 [REPLICATE] Network error, retrying in ${intervalSeconds}s...`)
      await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
    }
  }
  
  console.error('⏰ [REPLICATE] Prediction polling timeout!')
  throw new Error(`Prediction timeout after ${maxAttempts} attempts (${Math.ceil(maxAttempts * intervalSeconds)}s). This usually means the image is large or complex - try a smaller image or contact support.`)
}
