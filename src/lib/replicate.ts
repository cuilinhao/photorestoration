const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!
const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

// Model version for the colorization model
const MODEL_VERSION = '0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950'

interface PredictionResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  input: {
    model_name: string
    input_image: string
  }
  output?: string
  error?: string
  logs?: string
  created_at: string
  urls: {
    get: string
    cancel: string
  }
}

export async function createPrediction(imageUrl: string): Promise<PredictionResponse> {
  console.log('🚀 [REPLICATE] Creating prediction...')
  console.log('🖼️ [REPLICATE] Image URL:', imageUrl)
  console.log('🔧 [REPLICATE] Config:', {
    apiBase: REPLICATE_API_BASE,
    modelVersion: MODEL_VERSION,
    apiToken: REPLICATE_API_TOKEN ? `${REPLICATE_API_TOKEN.substring(0, 10)}...` : 'NOT SET'
  })

  const requestBody = {
    version: MODEL_VERSION,
    input: {
      model_name: 'Artistic',
      input_image: imageUrl
    }
  }

  console.log('📝 [REPLICATE] Request body:', JSON.stringify(requestBody, null, 2))

  try {
    const headers = {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
    
    console.log('📤 [REPLICATE] Request headers:', {
      ...headers,
      'Authorization': `Token ${REPLICATE_API_TOKEN.substring(0, 10)}...`
    })
    
    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    console.log('📨 [REPLICATE] Response status:', response.status, response.statusText)
    console.log('📨 [REPLICATE] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [REPLICATE] API error response:', errorText)
      throw new Error(`Failed to create prediction: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ [REPLICATE] Prediction created successfully!')
    console.log('📊 [REPLICATE] Response data:', JSON.stringify(data, null, 2))
    return data

  } catch (error) {
    console.error('💥 [REPLICATE] Create prediction error:', error)
    throw error
  }
}

export async function getPrediction(id: string): Promise<PredictionResponse> {
  console.log('🔍 [REPLICATE] Getting prediction status...')
  console.log('🆔 [REPLICATE] Prediction ID:', id)
  
  try {
    const headers = {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
    
    console.log('📤 [REPLICATE] Request URL:', `${REPLICATE_API_BASE}/predictions/${id}`)
    console.log('📤 [REPLICATE] Request headers:', {
      ...headers,
      'Authorization': `Token ${REPLICATE_API_TOKEN.substring(0, 10)}...`
    })
    
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${id}`, {
      method: 'GET',
      headers
    })

    console.log('📨 [REPLICATE] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [REPLICATE] API error response:', errorText)
      throw new Error(`Failed to get prediction: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📊 [REPLICATE] Prediction status:', data.status)
    console.log('📊 [REPLICATE] Full response:', JSON.stringify(data, null, 2))
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
