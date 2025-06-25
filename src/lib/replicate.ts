// Stub implementation for Replicate API
export async function createPrediction(url: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    id: crypto.randomUUID(),
    status: 'starting'
  }
}

export async function getPrediction(id: string) {
  return new Promise(resolve =>
    setTimeout(() =>
      resolve({
        status: 'succeeded',
        output: '/demo/old_photo_color.jpg'
      }),
      8000
    )
  )
}
