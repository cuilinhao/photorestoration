"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Moon, Sun, Globe, LogIn, User, LogOut } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useLanguage } from "@/contexts/LanguageContext"
import AuthModal from "@/components/AuthModal"

export default function Header() {
  const [isDark, setIsDark] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout, getRemainingUses, isLoading } = useUser()
  const { language, setLanguage, t } = useLanguage()
  const isLoggedIn = !!user && !isLoading
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 初始化主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('photo_restoration_theme')
    if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      // 如果没有保存的主题设置，默认设置为深色
      setIsDark(true)
      document.documentElement.classList.add('dark')
      localStorage.setItem('photo_restoration_theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('photo_restoration_theme', newIsDark ? 'dark' : 'light')
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
    { id: 'features', label: t('nav.features') },
    { id: 'cases', label: t('nav.showcase') },
    { id: 'uploader', label: t('nav.getStarted') },
    { id: 'faq', label: t('nav.faq') },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">PR</span>
          </div>
          <span className="font-bold text-xl">
            Photo Restoration
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
                  ? t('header.unlimited')
                  : `${getRemainingUses()}/${t('header.timesLeft')}`
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
              {t('header.signIn')}
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
                  {t('header.darkMode')}
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
                  {t('header.language')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                >
                  {t('header.chinese')}
                </Button>
              </div>

              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t('header.usage')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getRemainingUses() === -1 
                        ? t('header.unlimited')
                        : `${getRemainingUses()}/${t('header.timesLeft')}`
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
                    {t('header.signOut')}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('header.signIn')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}