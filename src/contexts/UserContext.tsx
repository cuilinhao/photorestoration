"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  email: string
  usageCount: number
  isPremium: boolean
  lastUsageDate: string
}

interface UserContextType {
  user: User | null
  login: (email: string) => Promise<boolean>
  logout: () => void
  canUseService: () => boolean
  incrementUsage: () => void
  getRemainingUses: () => number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEY = 'colorold_user'
const FREE_USAGE_LIMIT = 3

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // 从 localStorage 加载用户数据
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error loading user data:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // 保存用户数据到 localStorage
  const saveUser = (userData: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  // 简单的邮箱验证
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 登录函数
  const login = async (email: string): Promise<boolean> => {
    if (!isValidEmail(email)) {
      return false
    }

    // 检查是否是现有用户
    const existingUser = localStorage.getItem(`user_${email}`)
    if (existingUser) {
      try {
        const userData = JSON.parse(existingUser)
        saveUser(userData)
        return true
      } catch (error) {
        console.error('Error loading existing user:', error)
      }
    }

    // 创建新用户
    const newUser: User = {
      email,
      usageCount: 0,
      isPremium: false,
      lastUsageDate: new Date().toISOString()
    }

    // 保存到特定用户存储
    localStorage.setItem(`user_${email}`, JSON.stringify(newUser))
    saveUser(newUser)
    return true
  }

  // 登出函数
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  // 检查是否可以使用服务
  const canUseService = (): boolean => {
    if (!user) return false
    if (user.isPremium) return true
    
    // 检查当月使用次数
    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    // 如果是不同月份，重置使用次数
    if (today.getMonth() !== lastUsage.getMonth() || today.getFullYear() !== lastUsage.getFullYear()) {
      return true
    }
    
    return user.usageCount < FREE_USAGE_LIMIT
  }

  // 增加使用次数
  const incrementUsage = () => {
    if (!user) return

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    let newUsageCount = user.usageCount

    // 如果是不同月份，重置使用次数
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

    // 更新两个存储位置
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))
    saveUser(updatedUser)
  }

  // 获取剩余使用次数
  const getRemainingUses = (): number => {
    if (!user) return 0
    if (user.isPremium) return -1 // -1 表示无限制

    const today = new Date()
    const lastUsage = new Date(user.lastUsageDate)
    
    // 如果是不同月份，重置使用次数
    if (today.getMonth() !== lastUsage.getMonth() || today.getFullYear() !== lastUsage.getFullYear()) {
      return FREE_USAGE_LIMIT
    }
    
    return Math.max(0, FREE_USAGE_LIMIT - user.usageCount)
  }

  const value: UserContextType = {
    user,
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