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

const FREE_USAGE_LIMIT = 3

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
      let userProfile = await getProfile(userId)
      
      // If profile doesn't exist, create it
      if (!userProfile && supabaseUser) {
        userProfile = await createProfile({
          email: supabaseUser.email!,
          full_name: supabaseUser.user_metadata?.full_name
        })
      }

      if (userProfile) {
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
        
        setUser(userData)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [supabaseUser])

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
    } catch (error) {
      console.error('Sign up error:', error)
      return false
    }
  }

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: authUser } = await signInWithEmail(email, password)
      return !!authUser
    } catch (error) {
      console.error('Sign in error:', error)
      return false
    }
  }

  // Sign out user
  const signOutUser = async (): Promise<void> => {
    try {
      await supabaseSignOut()
      // State will be cleared via onAuthStateChange
    } catch (error) {
      console.error('Sign out error:', error)
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
    if (!user) return false
    if (user.isPremium) return true
    
    // Check monthly usage
    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    // If different month, reset usage
    if (today.getMonth() !== lastUsage.getMonth() || today.getFullYear() !== lastUsage.getFullYear()) {
      return true
    }
    
    return user.usageCount < FREE_USAGE_LIMIT
  }

  // Increment usage count
  const incrementUsage = async (): Promise<void> => {
    if (!user || !supabaseUser) return

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    let newUsageCount = user.usageCount

    // If different month, reset usage
    if (today.getMonth() !== lastUsage.getMonth() || today.getFullYear() !== lastUsage.getFullYear()) {
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
    if (!user) return 0
    if (user.isPremium) return -1 // -1 means unlimited

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    // If different month, reset usage
    if (today.getMonth() !== lastUsage.getMonth() || today.getFullYear() !== lastUsage.getFullYear()) {
      return FREE_USAGE_LIMIT
    }
    
    return Math.max(0, FREE_USAGE_LIMIT - user.usageCount)
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