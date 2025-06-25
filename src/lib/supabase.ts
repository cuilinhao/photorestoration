// Stub implementation for Supabase Storage
export async function uploadToStorage(file: File) {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Return local blob URL as placeholder for real Supabase URL
  return URL.createObjectURL(file)
}
