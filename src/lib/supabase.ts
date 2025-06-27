import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Database Types
export interface Profile {
  id: string
  username?: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'colorold-images'

export async function uploadToStorage(file: File): Promise<string> {
  console.log('🚀 [SUPABASE] Starting file upload...')
  console.log('📁 [SUPABASE] File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  })
  console.log('🔧 [SUPABASE] Config:', {
    url: supabaseUrl,
    bucket: BUCKET_NAME,
    anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'
  })

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`
    
    console.log('📝 [SUPABASE] Generated file path:', filePath)

    // First, try to check if bucket exists and is accessible
    console.log('🔍 [SUPABASE] Checking bucket accessibility...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    console.log('📦 [SUPABASE] Available buckets:', buckets)
    if (bucketError) {
      console.error('❌ [SUPABASE] Bucket list error:', bucketError)
    }

    // Upload file to Supabase Storage with different options
    console.log('⬆️ [SUPABASE] Attempting file upload...')
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true // Changed to true to avoid conflicts
    }
    console.log('⚙️ [SUPABASE] Upload options:', uploadOptions)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, uploadOptions)

    console.log('📤 [SUPABASE] Upload response:', { data, error })

    if (error) {
      console.error('❌ [SUPABASE] Upload error details:', {
        message: error.message,
        details: error
      })
      
      // Try alternative upload method if RLS is the issue
      if (error.message?.includes('policy') || error.message?.includes('RLS')) {
        console.log('🔄 [SUPABASE] Trying public upload method...')
        
        // Try uploading to a public path
        const publicPath = `public/${fileName}`
        const { data: publicData, error: publicError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(publicPath, file, {
            cacheControl: '3600',
            upsert: true
          })
          
        console.log('📤 [SUPABASE] Public upload response:', { data: publicData, error: publicError })
        
        if (publicError) {
          throw new Error(`Upload failed: ${publicError.message}`)
        }
        
        // Use public path for URL generation
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(publicPath)
          
        console.log('🔗 [SUPABASE] Public URL generated:', urlData.publicUrl)
        return urlData.publicUrl
      }
      
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    console.log('🔗 [SUPABASE] Getting public URL for path:', filePath)
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    console.log('🌐 [SUPABASE] Public URL response:', urlData)

    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    console.log('✅ [SUPABASE] File uploaded successfully!')
    console.log('🔗 [SUPABASE] Final URL:', urlData.publicUrl)
    return urlData.publicUrl

  } catch (error) {
    console.error('💥 [SUPABASE] Upload failed with error:', error)
    throw error
  }
}

// Auth Functions
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    throw error
  }
  return user
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data
}

export async function createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
