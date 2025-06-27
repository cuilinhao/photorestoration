"use client"

import { Badge } from "@/components/ui/badge"
import { Github, Twitter, Mail, Heart } from "lucide-react"

interface FooterProps {
  language?: 'zh' | 'en'
}

export default function Footer({ language = 'zh' }: FooterProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const text = {
    zh: {
      tagline: "让每一张珍贵的老照片重新焕发光彩",
      product: "产品",
      features: "功能特色",
      showcase: "案例展示",
      getStarted: "开始使用",
      support: "支持",
      faq: "常见问题",
      contact: "联系我们",
      privacy: "隐私政策",
      terms: "服务条款",
      company: "公司",
      about: "关于我们",
      blog: "博客",
      careers: "加入我们",
      madeWith: "用",
      and: "和",
      built: "构建",
      rights: "保留所有权利"
    },
    en: {
      tagline: "Bringing precious old photos back to life with AI",
      product: "Product",
      features: "Features",
      showcase: "Showcase", 
      getStarted: "Get Started",
      support: "Support",
      faq: "FAQ",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      company: "Company",
      about: "About Us",
      blog: "Blog", 
      careers: "Careers",
      madeWith: "Made with",
      and: "and",
      built: "built",
      rights: "All rights reserved"
    }
  }

  const t = text[language]

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl">ColorOld</span>
              <Badge variant="secondary">AI</Badge>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t.tagline}
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
            <h3 className="font-semibold mb-4">{t.product}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.features}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('cases')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.showcase}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('uploader')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.getStarted}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.support}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.faq}
                </button>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.contact}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.privacy}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{t.madeWith}</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>{t.and}</span>
            <span className="mx-1 font-semibold text-primary">FLUX AI</span>
            <span>{t.built}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 ColorOld. {t.rights}
          </div>
        </div>
      </div>
    </footer>
  )
}