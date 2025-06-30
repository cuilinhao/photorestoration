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
import { Mail, Crown, Sparkles, Eye, EyeOff, User } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp } = useUser()
  const { t, language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error(t('auth.invalidEmail'))
      return
    }

    if (!password.trim()) {
      toast.error(t('auth.passwordRequired'))
      return
    }

    if (mode === 'signup' && !fullName.trim()) {
      toast.error(t('auth.nameRequired'))
      return
    }

    setIsLoading(true)
    try {
      let success = false
      
      if (mode === 'signup') {
        console.log('开始注册用户:', { email: email.trim(), fullName: fullName.trim() })
        try {
          success = await signUp(email.trim(), password, fullName.trim())
          if (success) {
            console.log('用户注册成功:', email.trim())
            toast.success(t('auth.signupSuccess'), {
              position: 'top-center',
              duration: 3000
            })
            resetForm()
            onClose()
          }
        } catch (error: unknown) {
          console.log('用户注册失败:', { email: email.trim(), error: error instanceof Error ? error.message : String(error) })
          toast.error((error instanceof Error ? error.message : String(error)) || t('auth.signupFailed'), {
            position: 'top-center',
            duration: 4000
          })
          return // Exit early on error
        }
      } else {
        console.log('开始用户登录:', email.trim())
        try {
          success = await signIn(email.trim(), password)
          if (success) {
            console.log('用户登录成功:', email.trim())
            toast.success(t('auth.signinSuccess'), {
              position: 'top-center',
              duration: 3000
            })
            resetForm()
            onClose()
          }
        } catch (error: unknown) {
          console.log('用户登录失败:', { email: email.trim(), error: error instanceof Error ? error.message : String(error) })
          toast.error((error instanceof Error ? error.message : String(error)) || t('auth.signinFailed'), {
            position: 'top-center',
            duration: 4000
          })
          return // Exit early on error
        }
      }
    } catch (error) {
      console.error(`${mode === 'signup' ? '注册' : '登录'}异常错误:`, {
        email: email.trim(),
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error(mode === 'signup' ? t('auth.signupFailed') : t('auth.signinFailed'), {
        position: 'top-center',
        duration: 4000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setShowPassword(false)
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">PR</span>
            </div>
            {mode === 'signup' ? t('auth.signupTitle') : t('auth.signinTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup' ? t('auth.signupSubtitle') : t('auth.signinSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullNameLabel')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">
                  {t('auth.passwordHint')}
                </p>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signup' ? t('auth.signupLoading') : t('auth.signinLoading')}
                </div>
              ) : (
                mode === 'signup' ? t('auth.signupButton') : t('auth.signinButton')
              )}
            </Button>
          </div>

          {/* Mode Toggle */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signup' ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
              {' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                {mode === 'signup' ? t('auth.signinLink') : t('auth.signupLink')}
              </button>
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {/* Free Features */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('auth.freeFeatures')}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t('auth.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t('auth.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {t('auth.feature3')}
                </li>
              </ul>
            </div>

            {/* Premium Features */}
            <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                {t('auth.premiumFeatures')}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t('auth.premiumFeature1')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t('auth.premiumFeature2')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  {t('auth.premiumFeature3')}
                </li>
              </ul>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  toast.success(t('common.upgradeComingSoon'), {
                    position: 'top-center',
                    duration: 3000
                  })
                }}
                disabled={isLoading}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('auth.upgradeButton')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}