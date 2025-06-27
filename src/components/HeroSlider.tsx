"use client"

import ReactCompareImage from "react-compare-image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function HeroSlider() {
  const { t } = useLanguage()
  
  const scrollToUploader = () => {
    const uploaderElement = document.getElementById('uploader')
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="container">
        <div className="text-center mb-12">
          {/* Product Hunt Badge */}
          <div className="flex items-center justify-center mb-8">
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
              {t('hero.badge')}
            </Badge>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto mb-3 mt-4 max-w-6xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl">
            {t('hero.title')}
            <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl mb-8">
            {t('hero.subtitle')}
          </p>

          {/* CTA Button */}
          <div className="mb-8">
            <Button
              onClick={scrollToUploader}
              size="lg"
              className="h-14 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('hero.cta')}
            </Button>
          </div>

          {/* Happy Users */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-semibold"
                >
                  {String.fromCharCode(65 + i - 1)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>{t('hero.users')} <strong>10,000+</strong> {t('hero.usersTrust')}</span>
          </div>
        </div>

        {/* Demo Image Comparison */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-card border">
            <div className="aspect-[16/10] relative">
              <ReactCompareImage
                leftImage="/demo/old_photo_bw.jpg"
                rightImage="/demo/old_photo_color.jpg"
                sliderLineColor="hsl(var(--primary))"
                sliderLineWidth={4}
                handle={
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid white',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary))',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'white',
                      borderRadius: '50%'
                    }} />
                  </div>
                }
              />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('hero.dragTip')}
          </p>
        </div>
      </div>
    </section>
  )
}
