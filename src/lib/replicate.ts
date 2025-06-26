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
    const requestBody = { imageUrl };
    console.log('📝 [REPLICATE] Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch('/api/colorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📨 [REPLICATE] API response status:', response.status)
    console.log('📨 [REPLICATE] API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [REPLICATE] API error response text:', errorText)
      let errorData;
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      console.error('❌ [REPLICATE] API error data:', errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ [REPLICATE] Prediction created successfully!')
    console.log('📊 [REPLICATE] Response data:', JSON.stringify(data, null, 2))
    
    // 验证返回的数据结构
    if (!data.id) {
      console.error('❌ [REPLICATE] Missing prediction ID in response!')
      throw new Error('Invalid response: missing prediction ID')
    }
    
    console.log('🆔 [REPLICATE] Extracted prediction ID:', data.id)
    return data

  } catch (error) {
    console.error('💥 [REPLICATE] Create prediction error:', error)
    console.error('💥 [REPLICATE] Error type:', typeof error)
    console.error('💥 [REPLICATE] Error message:', error instanceof Error ? error.message : String(error))
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

// Poll prediction with time-based timeout and exponential backoff
export async function pollPrediction(id: string): Promise<PredictionResponse> {
  console.log('⏱️ [REPLICATE] Starting prediction polling with time-based timeout...')
  console.log('🆔 [REPLICATE] Prediction ID:', id)
  
  const startTime = Date.now()
  const MAX_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
  
  console.log('⏰ [REPLICATE] Max wait time: 10 minutes')
  
  while (true) {
    const elapsedTime = Date.now() - startTime
    const elapsedSeconds = Math.floor(elapsedTime / 1000)
    
    console.log(`🔄 [REPLICATE] Polling... (${elapsedSeconds}s elapsed)`)
    
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
        console.log(`⏱️ [REPLICATE] Total time: ${elapsedSeconds}s`)
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
      
      // Check for timeout AFTER getting the status
      if (elapsedTime > MAX_TIMEOUT) {
        console.error('⏰ [REPLICATE] Prediction polling timeout!')
        throw new Error(`Replicate still processing after 10 minutes. The image might be too large or complex. Try a smaller image or contact support.`)
      }
      
      // Still processing, wait and retry with exponential backoff
      // First minute: 3s intervals, after that: 6s intervals
      const waitTime = elapsedTime < 60_000 ? 3000 : 6000
      console.log(`⏳ [REPLICATE] Prediction still ${prediction.status}, waiting ${waitTime/1000}s...`)
      console.log(`⏱️ [REPLICATE] Progress: ${elapsedSeconds}s / 600s (10 min max)`)
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
    } catch (error) {
      // 如果是我们明确抛出的错误（failed/canceled/timeout），直接重新抛出
      if (error instanceof Error && (
        error.message.includes('failed') || 
        error.message.includes('canceled') ||
        error.message.includes('timeout') ||
        error.message.includes('still processing')
      )) {
        throw error
      }
      
      console.error(`💥 [REPLICATE] Poll request failed:`, error)
      
      // Check for timeout on network errors too
      if (elapsedTime > MAX_TIMEOUT) {
        throw new Error(`Network errors persisted for 10 minutes. Please try again later.`)
      }
      
      // Wait before retry on network error (shorter interval)
      console.log(`🔄 [REPLICATE] Network error, retrying in 3s...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
}
