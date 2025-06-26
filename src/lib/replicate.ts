// API 响应类型
interface PredictionResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string
  error?: string
  logs?: string
}

// 创建图像修复预测
export async function createPrediction(imageUrl: string): Promise<PredictionResponse> {
  const response = await fetch('/api/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
export async function getPrediction(id: string): Promise<PredictionResponse> {
  const response = await fetch(`/api/restore/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}
