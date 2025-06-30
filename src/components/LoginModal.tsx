"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Crown, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  language?: 'zh' | 'en'
}

export default function LoginModal({ isOpen, onClose, language = 'zh' }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useUser()

  const text = {
    zh: {
      title: "登录 Photo Restoration",
      subtitle: "输入您的邮箱地址开始使用 AI 照片修复服务",
      emailLabel: "邮箱地址",
      emailPlaceholder: "请输入您的邮箱",
      loginButton: "立即登录",
      freeFeatures: "免费用户权益",
      feature1: "每月 3 次免费修复",
      feature2: "高质量 AI 修复",
      feature3: "2K 高清输出",
      premiumFeatures: "付费用户额外权益",
      premiumFeature1: "无限次数修复",
      premiumFeature2: "优先处理队列",
      premiumFeature3: "批量处理功能",
      upgradeButton: "升级到付费版",
      invalidEmail: "请输入有效的邮箱地址",
      loginSuccess: "登录成功！",
      loginFailed: "登录失败，请重试"
    },
    en: {
      title: "Sign In to Photo Restoration",
      subtitle: "Enter your email address to start using AI photo restoration service",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      loginButton: "Sign In",
      freeFeatures: "Free User Benefits",
      feature1: "3 free restorations per month",
      feature2: "High-quality AI restoration",
      feature3: "2K HD output",
      premiumFeatures: "Premium User Benefits",
      premiumFeature1: "Unlimited restorations",
      premiumFeature2: "Priority processing",
      premiumFeature3: "Batch processing",
      upgradeButton: "Upgrade to Premium",
      invalidEmail: "Please enter a valid email address",
      loginSuccess: "Login successful!",
      loginFailed: "Login failed, please try again"
    }
  }

  const t = text[language]

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error(t.invalidEmail)
      return
    }

    setIsLoading(true)
    try {
      const success = await login(email.trim())
      if (success) {
        toast.success(t.loginSuccess)
        onClose()
        setEmail("")
      } else {
        toast.error(t.invalidEmail)
      }
    } catch (error) {
      toast.error(t.loginFailed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">PR</span>
            </div>
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Login Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === 'zh' ? '登录中...' : 'Signing in...'}
                </div>
              ) : (
                t.loginButton
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {/* Free Features */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t.freeFeatures}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t.feature1}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t.feature2}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t.feature3}
                </li>
              </ul>
            </div>

            {/* Premium Features */}
            <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                {t.premiumFeatures}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t.premiumFeature1}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t.premiumFeature2}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t.premiumFeature3}
                </li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  toast.success(language === 'zh' ? '升级功能开发中，敬请期待！' : 'Upgrade feature coming soon!')
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t.upgradeButton}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}