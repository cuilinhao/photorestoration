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

const GUEST_USAGE_LIMIT = 10  // 未登录用户限制
const LOGGED_IN_USAGE_LIMIT = 20  // 登录用户限制

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
      
      let userProfile = await getProfile(userId)
      
      // If profile doesn't exist, create it using current supabase user
      if (!userProfile) {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          console.log('Creating new profile for user:', currentUser.email)
          userProfile = await createProfile({
            email: currentUser.email!,
            full_name: currentUser.user_metadata?.full_name
          })
        }
      }

      if (userProfile) {
        console.log('Profile loaded successfully:', userProfile.email)
        setProfile(userProfile)
        
        // Load usage data from localStorage for now (later can be moved to database)
        const savedUsage = localStorage.getItem(`usage_${userId}`)
        let usageData = { usageCount: 0, lastUsageDate: new Date().toISOString() }
        
        if (savedUsage) {
          try {
            usageData = JSON.parse(savedUsage)
          } catch (e) {
            console.error('Error parsing usage data:', e)
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
      const { user: authUser } = await signInWithEmail(email, password)
      return !!authUser
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      
      // Handle specific Supabase errors
      if (error instanceof Error && error.message?.includes('For security purposes')) {
        throw new Error('操作频繁，请稍后再试')
      } else if (error instanceof Error && error.message?.includes('Invalid login credentials')) {
        throw new Error('邮箱或密码错误')
      } else if (error instanceof Error && error.message?.includes('Email not confirmed')) {
        throw new Error('请先验证邮箱')
      } else if (error instanceof Error && error.message?.includes('Too many requests')) {
        throw new Error('请求过于频繁，请稍后再试')
      }
      
      // Default error message
      throw new Error('登录失败，请检查邮箱和密码')
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
    if (!user) {
      // 未登录用户的限制检查
      const guestUsage = localStorage.getItem('guest_usage')
      if (guestUsage) {
        const usage = JSON.parse(guestUsage)
        const today = new Date().toISOString().split('T')[0]
        
        // 如果是新的一天，重置次数
        if (usage.lastUsageDate.split('T')[0] !== today) {
          return true
        }
        
        return usage.count < GUEST_USAGE_LIMIT
      }
      return true
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
    if (!user) {
      // 未登录用户，在localStorage中记录使用次数
      const guestUsage = localStorage.getItem('guest_usage')
      let usage = { count: 0, lastUsageDate: new Date().toISOString() }
      
      if (guestUsage) {
        usage = JSON.parse(guestUsage)
      }
      
      // 检查是否是新的一天
      const today = new Date().toISOString().split('T')[0]
      if (usage.lastUsageDate.split('T')[0] !== today) {
        usage.count = 1
      } else {
        usage.count += 1
      }
      
      usage.lastUsageDate = new Date().toISOString()
      localStorage.setItem('guest_usage', JSON.stringify(usage))
      return
    }

    if (!supabaseUser || user.isPremium) return

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
    localStorage.setItem(`usage_${supabaseUser.id}`, JSON.stringify({
      usageCount: newUsageCount,
      lastUsageDate: today.toISOString()
    }))

    setUser(updatedUser)
  }

  // Get remaining uses
  const getRemainingUses = (): number => {
    if (!user) {
      // 未登录用户剩余次数
      const guestUsage = localStorage.getItem('guest_usage')
      if (guestUsage) {
        const usage = JSON.parse(guestUsage)
        const today = new Date().toISOString().split('T')[0]
        
        // 如果是新的一天，返回全部次数
        if (usage.lastUsageDate.split('T')[0] !== today) {
          return GUEST_USAGE_LIMIT
        }
        
        return Math.max(0, GUEST_USAGE_LIMIT - usage.count)
      }
      return GUEST_USAGE_LIMIT
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