"use client"

import { Sparkles, Zap, Image, Download } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FeatureSection() {
  const { t } = useLanguage()
  
  const features = [
    {
      icon: Sparkles,
      title: t('features.aiRestore.title'),
      description: t('features.aiRestore.desc')
    },
    {
      icon: Zap,
      title: t('features.oneClickColor.title'),
      description: t('features.oneClickColor.desc')
    },
    {
      icon: Image,
      title: t('features.hdRestore.title'),
      description: t('features.hdRestore.desc')
    },
    {
      icon: Download,
      title: t('features.easyToUse.title'),
      description: t('features.easyToUse.desc')
    }
  ]

  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            {t('features.title')} <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">Photo Restoration</span>
          </h2>
          <p className="text-muted-foreground lg:text-xl max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-card border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="mb-3 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}