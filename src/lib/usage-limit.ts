import { NextRequest } from 'next/server'

const LOGGED_IN_USAGE_LIMIT = 5  // 登录用户每日限制

interface UsageData {
  count: number
  lastUsageDate: string
}

/**
 * 获取客户端IP地址
 */
function getClientIP(request: NextRequest): string {
  // 尝试从各种头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // 如果都没有，使用一个默认值（在开发环境中）
  return 'unknown-ip'
}

/**
 * 检查IP是否可以使用服务（基于每日限制）
 */
export function canUseServiceByIP(request: NextRequest): boolean {
  // 从请求头获取用户登录状态
  const isLoggedIn = request.headers.get('x-user-logged-in') === 'true'

  // 必须登录才能使用
  if (!isLoggedIn) {
    return false
  }

  const ip = getClientIP(request)
  const usageLimit = LOGGED_IN_USAGE_LIMIT

  try {
    // 在服务器端，我们需要使用其他方式存储，这里先用内存存储
    // 在生产环境中，应该使用Redis或数据库
    const usage = getIPUsageFromMemory(ip)

    if (!usage) {
      return true
    }

    const today = new Date().toISOString().split('T')[0]

    // 如果是新的一天，重置次数
    if (usage.lastUsageDate.split('T')[0] !== today) {
      return true
    }

    return usage.count < usageLimit
  } catch (error) {
    console.error('Error checking IP usage:', error)
    // 如果检查失败，不允许使用（更安全）
    return false
  }
}

/**
 * 增加IP的使用次数
 */
export function incrementIPUsage(request: NextRequest): void {
  const ip = getClientIP(request)
  
  try {
    const existingUsage = getIPUsageFromMemory(ip)
    const today = new Date().toISOString()
    const todayDate = today.split('T')[0]

    let usage: UsageData

    if (!existingUsage || existingUsage.lastUsageDate.split('T')[0] !== todayDate) {
      // 新的一天或者第一次使用
      usage = { count: 1, lastUsageDate: today }
    } else {
      // 同一天，增加使用次数
      usage = { count: existingUsage.count + 1, lastUsageDate: today }
    }

    setIPUsageInMemory(ip, usage)
  } catch (error) {
    console.error('Error incrementing IP usage:', error)
  }
}

/**
 * 获取IP剩余使用次数
 */
export function getRemainingUsesByIP(request: NextRequest): number {
  // 从请求头获取用户登录状态
  const isLoggedIn = request.headers.get('x-user-logged-in') === 'true'

  // 必须登录才能使用
  if (!isLoggedIn) {
    return 0
  }

  const ip = getClientIP(request)
  const usageLimit = LOGGED_IN_USAGE_LIMIT

  try {
    const usage = getIPUsageFromMemory(ip)

    if (!usage) {
      return usageLimit
    }

    const today = new Date().toISOString().split('T')[0]

    // 如果是新的一天，返回全部次数
    if (usage.lastUsageDate.split('T')[0] !== today) {
      return usageLimit
    }

    return Math.max(0, usageLimit - usage.count)
  } catch (error) {
    console.error('Error getting remaining uses by IP:', error)
    return 0
  }
}

// 简单的内存存储（生产环境应该使用Redis或数据库）
const ipUsageMemory = new Map<string, UsageData>()

function getIPUsageFromMemory(ip: string): UsageData | null {
  return ipUsageMemory.get(ip) || null
}

function setIPUsageInMemory(ip: string, usage: UsageData): void {
  ipUsageMemory.set(ip, usage)
  
  // 清理过期数据（保留最近7天的数据）
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  for (const [key, value] of ipUsageMemory.entries()) {
    const usageDate = new Date(value.lastUsageDate)
    if (usageDate < sevenDaysAgo) {
      ipUsageMemory.delete(key)
    }
  }
}
