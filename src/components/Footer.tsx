"use client"

import { Badge } from "@/components/ui/badge"
import { Github, Twitter, Mail, Heart } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">PR</span>
              </div>
              <span className="font-bold text-xl">Photo Restoration</span>
              <Badge variant="secondary">AI</Badge>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('footer.slogan')}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.features')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('cases')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.showcase')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('uploader')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.getStarted')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>and</span>
            <span className="mx-1 font-semibold text-primary">FLUX AI</span>
            <span>built</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  )
}