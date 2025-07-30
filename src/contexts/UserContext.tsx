"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { 
  supabase, 
  Profile, 
  signUpWithEmail, 
  signInWithEmail, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getProfile,
  createProfile,
  updateProfile 
} from '@/lib/supabase'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  usageCount: number
  isPremium: boolean
  lastUsageDate: string
}

interface UserContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  profile: Profile | null
  isLoading: boolean
  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  // Legacy methods (kept for compatibility)
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  // Usage methods
  canUseService: () => boolean
  incrementUsage: () => Promise<void>
  getRemainingUses: () => number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const LOGGED_IN_USAGE_LIMIT = 5  // 登录用户每日限制

// Helper function to convert profile to user format
const profileToUser = (profile: Profile): User => ({
  id: profile.id,
  email: profile.email,
  full_name: profile.full_name,
  avatar_url: profile.avatar_url,
  usageCount: 0, // Will be updated from usage tracking
  isPremium: false, // Will be updated from subscription status
  lastUsageDate: new Date().toISOString()
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId)

      console.log('Calling getProfile...')
      let userProfile = await getProfile(userId)
      console.log('getProfile result:', userProfile)

      // If profile doesn't exist, create it using current supabase user
      if (!userProfile) {
        console.log('Profile not found, creating new profile...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          console.log('Creating new profile for user:', currentUser.email)
          userProfile = await createProfile({
            email: currentUser.email!,
            full_name: currentUser.user_metadata?.full_name
          })
          console.log('createProfile result:', userProfile)
        }
      }

      if (userProfile) {
        console.log('Profile loaded successfully:', userProfile.email)
        setProfile(userProfile)
        
        // Load usage data from localStorage for now (later can be moved to database)
        let usageData = { usageCount: 0, lastUsageDate: new Date().toISOString() }

        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined') {
          const savedUsage = localStorage.getItem(`usage_${userId}`)
          if (savedUsage) {
            try {
              usageData = JSON.parse(savedUsage)
            } catch (e) {
              console.error('Error parsing usage data:', e)
            }
          }
        }

        const userData: User = {
          ...profileToUser(userProfile),
          usageCount: usageData.usageCount,
          lastUsageDate: usageData.lastUsageDate
        }
        
        console.log('Setting user data:', userData.email)
        setUser(userData)
      } else {
        console.error('Failed to load or create user profile')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Don't throw error, just log it to prevent breaking the auth flow
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setProfile(null)
          setUser(null)
        }
        
        // Ensure loading state is updated after auth change
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  // Sign up new user
  const signUp = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      const { user: authUser } = await signUpWithEmail(email, password, fullName)
      
      if (authUser) {
        // Profile will be created automatically via onAuthStateChange
        return true
      }
      
      return false
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      
      // Handle specific Supabase errors
      if (error instanceof Error && error.message?.includes('For security purposes')) {
        throw new Error('操作频繁，请稍后再试')
      } else if (error instanceof Error && error.message?.includes('User already registered')) {
        throw new Error('该邮箱已被注册')
      } else if (error instanceof Error && error.message?.includes('Invalid login credentials')) {
        throw new Error('邮箱或密码错误')
      } else if (error instanceof Error && error.message?.includes('Password should be at least')) {
        throw new Error('密码至少需蝑6位字符')
      } else if (error instanceof Error && error.message?.includes('Unable to validate email address')) {
        throw new Error('邮箱格式不正确')
      }
      
      // Default error message
      throw new Error('注册失败，请稍后再试')
    }
  }

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('尝试登录用户:', email)
      const { user: authUser } = await signInWithEmail(email, password)
      console.log('登录响应:', { user: authUser?.email, confirmed: authUser?.email_confirmed_at })
      
      if (authUser) {
        console.log('登录成功，用户ID:', authUser.id)
        // 登录成功后，loadUserData 会通过 auth state change 自动触发
        // 这里我们只需要返回 true，用户状态会自动更新
        return true
      }
      
      console.log('登录失败：未返回用户信息')
      return false
    } catch (error: unknown) {
      console.error('登录错误详情:', error)
      
      // Handle specific Supabase errors with error codes for translation
      if (error instanceof Error && error.message?.includes('For security purposes')) {
        const err = new Error('AUTH_OPERATION_TOO_FREQUENT')
        err.name = 'AuthError'
        throw err
      } else if (error instanceof Error && error.message?.includes('Invalid login credentials')) {
        const err = new Error('AUTH_INVALID_CREDENTIALS')
        err.name = 'AuthError'
        throw err
      } else if (error instanceof Error && error.message?.includes('Email not confirmed')) {
        // Email verification is disabled, this should not happen
        console.warn('Email not confirmed error received but verification is disabled')
        const err = new Error('AUTH_ACCOUNT_VERIFICATION_FAILED')
        err.name = 'AuthError'
        throw err
      } else if (error instanceof Error && error.message?.includes('Too many requests')) {
        const err = new Error('AUTH_TOO_MANY_REQUESTS')
        err.name = 'AuthError'
        throw err
      }

      // Default error message
      const err = new Error('AUTH_SIGNIN_FAILED_CHECK_CREDENTIALS')
      err.name = 'AuthError'
      throw err
    }
  }

  // Sign out user
  const signOutUser = async (): Promise<void> => {
    try {
      await supabaseSignOut()
      // State will be cleared via onAuthStateChange
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      // 即使退出失败，也手动清理本地状态
      setSupabaseUser(null)
      setProfile(null)
      setUser(null)
      
      // 如果是网络错误，不抛出异常
      if ((error instanceof Error && error.message?.includes('Failed to fetch')) || (error instanceof Error && error.message?.includes('NetworkError'))) {
        console.log('网络错误，本地退出登录')
        return
      }
      
      throw error
    }
  }

  // Legacy login method for compatibility (now requires password)
  const login = async (email: string, password: string = ''): Promise<boolean> => {
    if (!password) {
      // For backward compatibility, if no password provided, assume this is old behavior
      // You might want to show a message asking user to set a password
      return false
    }
    return signIn(email, password)
  }

  // Legacy logout method
  const logout = () => {
    signOutUser()
  }

  // Check if user can use service
  const canUseService = (): boolean => {
    // 必须登录才能使用
    if (!user) {
      return false
    }

    if (user.isPremium) return true

    // Check daily usage for logged in users
    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)

    // If different day, reset usage
    if (today.toDateString() !== lastUsage.toDateString()) {
      return true
    }

    return user.usageCount < LOGGED_IN_USAGE_LIMIT
  }

  // Increment usage count
  const incrementUsage = async (): Promise<void> => {
    // 只有登录用户才能使用
    if (!user || !supabaseUser) {
      return
    }

    if (user.isPremium) return

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)

    let newUsageCount = user.usageCount

    // If different day, reset usage
    if (today.toDateString() !== lastUsage.toDateString()) {
      newUsageCount = 1
    } else {
      newUsageCount += 1
    }

    const updatedUser: User = {
      ...user,
      usageCount: newUsageCount,
      lastUsageDate: today.toISOString()
    }

    // Save to localStorage (later can be moved to database)
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      localStorage.setItem(`usage_${supabaseUser.id}`, JSON.stringify({
        usageCount: newUsageCount,
        lastUsageDate: today.toISOString()
      }))
    }

    setUser(updatedUser)
  }

  // Get remaining uses
  const getRemainingUses = (): number => {
    if (!user) {
      return 0 // 未登录用户没有使用次数
    }

    if (user.isPremium) return -1 // -1 means unlimited

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)

    // If different day, reset usage
    if (today.toDateString() !== lastUsage.toDateString()) {
      return LOGGED_IN_USAGE_LIMIT
    }

    return Math.max(0, LOGGED_IN_USAGE_LIMIT - user.usageCount)
  }

  const value: UserContextType = {
    user,
    supabaseUser,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut: signOutUser,
    login,
    logout,
    canUseService,
    incrementUsage,
    getRemainingUses
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}