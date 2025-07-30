import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

// Create client - will use fallback if not configured
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
)

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'photo-restoration-images'

export async function uploadToStorage(file: File): Promise<string> {
  console.log('🚀 [UPLOAD] Starting file upload...')
  console.log('📁 [UPLOAD] File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  })

  // Check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('dummy')) {
    console.log('⚠️ [UPLOAD] Supabase not configured, using base64 data URL fallback')
    return await createLocalBlobUrl(file)
  }

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
    console.log('🔄 [UPLOAD] Falling back to base64 data URL')
    return await createLocalBlobUrl(file)
  }
}

// Fallback function to convert file to base64 data URL (compatible with Replicate)
function createLocalBlobUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const dataUrl = reader.result as string
      console.log('📎 [UPLOAD] Created base64 data URL:', dataUrl.substring(0, 60) + '...')
      resolve(dataUrl)
    }
    
    reader.onerror = () => {
      console.error('❌ [UPLOAD] Failed to read file as base64')
      reject(new Error('Failed to convert file to base64'))
    }
    
    // Convert to base64 data URL (data:image/jpeg;base64,...)
    reader.readAsDataURL(file)
  })
}

// Auth Functions
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // 禁用邮箱重定向
      data: {
        full_name: fullName
      }
    }
  })

  // Note: Email verification is handled at the Supabase project level
  // Make sure to disable "Enable email confirmations" in your Supabase project settings

  if (error) {
    console.error('Supabase signup error:', error)
    throw error
  }

  // 如果用户创建成功但需要邮箱验证，我们仍然返回成功
  // 因为在项目设置中应该禁用邮箱验证
  console.log('Signup successful:', {
    user: data.user?.email,
    confirmed: data.user?.email_confirmed_at,
    session: !!data.session
  })

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Supabase signin error:', error)

    // 如果是邮箱未确认的错误，提供更详细的信息
    if (error.message?.includes('Email not confirmed')) {
      console.error('Email not confirmed error - check Supabase auth settings')
      throw new Error('邮箱未验证。请检查 Supabase 项目设置中是否禁用了邮箱验证，或联系管理员手动确认账户。')
    }

    throw error
  }

  console.log('Signin successful:', {
    user: data.user?.email,
    confirmed: data.user?.email_confirmed_at,
    session: !!data.session
  })

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
  // Get current user to use their ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No authenticated user found')
  }

  const profileData = {
    id: user.id, // Use the auth user's ID
    ...profile
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Profile creation error:', error)
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

// Manual user confirmation (if needed as fallback)
export async function confirmUser(email: string) {
  try {
    // This is a workaround to manually confirm users if email verification is causing issues
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === email) {
      console.log('User is already authenticated, no confirmation needed')
      return true
    }
    return false
  } catch (error) {
    console.error('Manual confirmation error:', error)
    return false
  }
}
