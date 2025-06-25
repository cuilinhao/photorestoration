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
  try {
    console.log('Creating prediction for image:', imageUrl)
    
    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          model_name: 'Artistic',
          input_image: imageUrl
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API error:', response.status, errorText)
      throw new Error(`Failed to create prediction: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Prediction created:', data.id)
    return data

  } catch (error) {
    console.error('Create prediction error:', error)
    throw error
  }
}

export async function getPrediction(id: string): Promise<PredictionResponse> {
  try {
    console.log('Getting prediction:', id)
    
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API error:', response.status, errorText)
      throw new Error(`Failed to get prediction: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Prediction status:', data.status, data.id)
    return data

  } catch (error) {
    console.error('Get prediction error:', error)
    throw error
  }
}

// Poll prediction with timeout and retry logic
export async function pollPrediction(id: string, maxAttempts = 30, intervalSeconds = 3): Promise<PredictionResponse> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const prediction = await getPrediction(id)
      
      // Check if prediction is complete
      if (prediction.status === 'succeeded') {
        console.log('Prediction completed successfully:', prediction.id)
        return prediction
      }
      
      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`)
      }
      
      // Still processing, wait and retry
      console.log(`Prediction ${id} still ${prediction.status}, attempt ${attempt}/${maxAttempts}`)
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
      }
      
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      // Wait before retry on error
      await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000))
    }
  }
  
  throw new Error(`Prediction timeout after ${maxAttempts} attempts`)
}
