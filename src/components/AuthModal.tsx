"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { supabase } from "@/lib/supabase"
import styles from "./AuthModal.module.css"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const { signIn, signUp } = useUser()
  const { t, language } = useLanguage()

  // 翻译错误信息
  const translateError = (error: Error): string => {
    if (error.name === 'AuthError') {
      switch (error.message) {
        case 'AUTH_INVALID_CREDENTIALS':
          return t('auth.invalidCredentials')
        case 'AUTH_TOO_MANY_REQUESTS':
          return t('auth.tooManyRequests')
        case 'AUTH_OPERATION_TOO_FREQUENT':
          return t('auth.operationTooFrequent')
        case 'AUTH_ACCOUNT_VERIFICATION_FAILED':
          return t('auth.accountVerificationFailed')
        case 'AUTH_SIGNIN_FAILED_CHECK_CREDENTIALS':
          return t('auth.signinFailedCheckCredentials')
        default:
          return error.message
      }
    }
    return error.message
  }

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

    if (mode === 'signup') {
      if (!firstName.trim()) {
        toast.error(t('auth.firstNameRequired'))
        return
      }
      
      if (!lastName.trim()) {
        toast.error(t('auth.lastNameRequired'))
        return
      }
      
      if (password !== confirmPassword) {
        toast.error(t('auth.confirmPasswordMismatch'))
        return
      }
      
      if (password.length < 6) {
        toast.error(t('auth.passwordTooShort'))
        return
      }
    }

    setIsLoading(true)
    try {
      let success = false
      
      if (mode === 'signup') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`
        console.log('开始注册用户:', { email: email.trim(), fullName })
        try {
          success = await signUp(email.trim(), password, fullName)
          if (success) {
            console.log('用户注册成功:', email.trim())
            toast.success(t('auth.signupSuccess'), {
              position: 'top-center',
              duration: 3000
            })
            // 显示邮箱验证提示
            setShowEmailVerification(true)
            return
          }
        } catch (error: unknown) {
          console.log('用户注册失败:', { email: email.trim(), error: error instanceof Error ? error.message : String(error) })
          
          // 检查是否需要邮箱验证
          if (error instanceof Error && error.message?.includes('Email not confirmed')) {
            setShowEmailVerification(true)
            return
          }
          
          toast.error((error instanceof Error ? translateError(error) : String(error)) || t('auth.signupFailed'), {
            position: 'top-center',
            duration: 4000
          })
          return
        }
      } else {
        console.log('开始用户登录:', email.trim())
        try {
          console.log('AuthModal: 开始调用 signIn')
          success = await signIn(email.trim(), password)
          console.log('AuthModal: signIn 返回结果:', success)
          if (success) {
            console.log('用户登录成功:', email.trim())
            toast.success(t('auth.signinSuccess'), {
              position: 'top-center',
              duration: 3000
            })
            resetForm()
            onClose()
          } else {
            console.log('AuthModal: signIn 返回 false')
            toast.error('登录失败，请重试')
          }
        } catch (error: unknown) {
          console.log('用户登录失败:', { email: email.trim(), error: error instanceof Error ? error.message : String(error) })
          
          // 检查是否是邮箱验证问题
          if (error instanceof Error && (
            error.message?.includes('Email not confirmed') || 
            error.message?.includes('邮箱未验证')
          )) {
            setShowEmailVerification(true)
            return
          }
          
          toast.error((error instanceof Error ? translateError(error) : String(error)) || t('auth.signinFailed'), {
            position: 'top-center',
            duration: 4000
          })
          return
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
    setConfirmPassword("")
    setFirstName("")
    setLastName("")
    setShowEmailVerification(false)
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    resetForm()
  }

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error(t('auth.invalidEmail'))
      return
    }

    setIsResendingEmail(true)
    try {
      // 重新发送验证邮件
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      })

      if (error) {
        console.error('Resend verification error:', error)
        toast.error(t('auth.emailVerificationFailed'))
      } else {
        toast.success(t('auth.verificationEmailSent'), {
          position: 'top-center',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(t('auth.emailVerificationFailed'))
    } finally {
      setIsResendingEmail(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent">
        <DialogTitle className="sr-only">
          {mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {mode === 'signup' ? 'Create a new account' : 'Sign in to your account'}
        </DialogDescription>
        <div className="auth-modal-container">
          {showEmailVerification ? (
            <div className={styles.form}>
              <p className={styles.title}>
                {t('auth.emailNotConfirmed')}
              </p>
              <p className={styles.message}>
                {t('auth.checkEmailInbox')}
              </p>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '15px' }}>
                  {t('auth.emailVerificationSent')}: <strong>{email}</strong>
                </p>
                
                <button 
                  type="button"
                  className={styles.submit}
                  onClick={handleResendVerification}
                  disabled={isResendingEmail}
                  style={{ marginBottom: '10px' }}
                >
                  {isResendingEmail ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTop: '2px solid white', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                      {language === 'zh' ? '发送中...' : 'Sending...'}
                    </div>
                  ) : (
                    t('auth.resendVerification')
                  )}
                </button>
                
                <p className={styles.signin}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      setShowEmailVerification(false)
                      resetForm()
                    }}
                  >
                    {language === 'zh' ? '返回登录' : 'Back to Sign In'}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.title}>
                {mode === 'signup' ? t('auth.signupTitle') : t('auth.signinTitle')}
              </p>
              <p className={styles.message}>
                {mode === 'signup' 
                  ? t('auth.signupSubtitle')
                  : t('auth.signinSubtitle')
                }
              </p>
              
              {mode === 'signup' && (
                <div className={styles.flex}>
                  <label>
                    <input 
                      className={styles.input} 
                      type="text" 
                      placeholder="" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                    <span>{language === 'zh' ? '名字' : 'Firstname'}</span>
                  </label>

                  <label>
                    <input 
                      className={styles.input} 
                      type="text" 
                      placeholder="" 
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                    <span>{language === 'zh' ? '姓氏' : 'Lastname'}</span>
                  </label>
                </div>
              )}
                          
              <label>
                <input 
                  className={styles.input} 
                  type="email" 
                  placeholder="" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <span>{language === 'zh' ? '邮箱' : 'Email'}</span>
              </label> 
                  
              <label>
                <input 
                  className={styles.input} 
                  type="password" 
                  placeholder="" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                />
                <span>{language === 'zh' ? '密码' : 'Password'}</span>
              </label>
              
              {mode === 'signup' && (
                <label>
                  <input 
                    className={styles.input} 
                    type="password" 
                    placeholder="" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    minLength={6}
                  />
                  <span>{language === 'zh' ? '确认密码' : 'Confirm password'}</span>
                </label>
              )}
              
              <button 
                type="submit" 
                className={styles.submit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }} />
                    {mode === 'signup' ? t('auth.signupLoading') : t('auth.signinLoading')}
                  </div>
                ) : (
                  mode === 'signup' ? t('auth.signupButton') : t('auth.signinButton')
                )}
              </button>
              
              <p className={styles.signin}>
                {mode === 'signup' ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    toggleMode()
                  }}
                >
                  {mode === 'signup' ? t('auth.signinLink') : t('auth.signupLink')}
                </a>
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
