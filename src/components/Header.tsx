"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Moon, Sun, Globe, LogIn, User, LogOut } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import LoginModal from "@/components/LoginModal"

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout, getRemainingUses } = useUser()
  const isLoggedIn = !!user
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const navItems = [
    { id: 'features', label: language === 'zh' ? '功能特色' : 'Features' },
    { id: 'cases', label: language === 'zh' ? '案例展示' : 'Showcase' },
    { id: 'uploader', label: language === 'zh' ? '开始使用' : 'Get Started' },
    { id: 'faq', label: language === 'zh' ? '常见问题' : 'FAQ' },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-xl">
            ColorOld
          </span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            AI
          </Badge>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hidden sm:inline-flex"
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:inline-flex"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User/Login */}
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center space-x-2">
              <div className="text-xs text-muted-foreground">
                {getRemainingUses() === -1 
                  ? (language === 'zh' ? '无限制' : 'Unlimited')
                  : `${getRemainingUses()}/${language === 'zh' ? '次' : ' left'}`
                }
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => setShowLoginModal(true)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {language === 'zh' ? '登录' : 'Sign In'}
            </Button>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            {/* Mobile Navigation */}
            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <hr />

            {/* Mobile Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === 'zh' ? '深色模式' : 'Dark Mode'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === 'zh' ? '语言' : 'Language'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                >
                  {language === 'zh' ? '中文' : 'English'}
                </Button>
              </div>

              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === 'zh' ? '使用次数' : 'Usage'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getRemainingUses() === -1 
                        ? (language === 'zh' ? '无限制' : 'Unlimited')
                        : `${getRemainingUses()}/${language === 'zh' ? '次' : ' left'}`
                      }
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === 'zh' ? '登出' : 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '登录' : 'Sign In'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        language={language}
      />
    </>
  )
}