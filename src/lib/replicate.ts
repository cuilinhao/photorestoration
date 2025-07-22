// API 响应类型
interface PredictionResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string
  error?: string
  logs?: string
}

// 创建图像修复预测
export async function createPrediction(imageUrl: string, language?: string, isLoggedIn?: boolean): Promise<PredictionResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (language) {
    headers['x-language'] = language
  }
  if (typeof isLoggedIn === 'boolean') {
    headers['x-user-logged-in'] = isLoggedIn.toString()
  }

  const response = await fetch('/api/restore', {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageUrl })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `API error: ${response.status}`)
  }

  const data = await response.json()
  if (!data.id) {
    throw new Error('Invalid response: missing prediction ID')
  }

  return data
}

// 获取预测状态
export async function getPrediction(id: string, language?: string, isLoggedIn?: boolean): Promise<PredictionResponse> {
  const headers: Record<string, string> = {}
  if (language) {
    headers['x-language'] = language
  }
  if (typeof isLoggedIn === 'boolean') {
    headers['x-user-logged-in'] = isLoggedIn.toString()
  }

  const response = await fetch(`/api/restore/${id}`, {
    headers: Object.keys(headers).length > 0 ? headers : undefined
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}
