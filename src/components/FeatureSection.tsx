"use client"

import { Sparkles, Zap, Image, Download } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI 智能修复",
    description: "采用最新 FLUX AI 模型，智能识别并修复老照片中的损伤、划痕和污渍"
  },
  {
    icon: Zap,
    title: "一键上色",
    description: "60秒内将黑白照片变成生动的彩色照片，让回忆重新焕发光彩"
  },
  {
    icon: Image,
    title: "高清还原",
    description: "输出2K高清画质，细节丰富，让老照片重获新生"
  },
  {
    icon: Download,
    title: "简单易用",
    description: "拖拽上传即可开始处理，无需复杂操作，一键下载处理结果"
  }
]

export default function FeatureSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            为什么选择 <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">ColorOld</span>
          </h2>
          <p className="text-muted-foreground lg:text-xl max-w-3xl mx-auto">
            专业的 AI 照片修复技术，让每一张珍贵的老照片都能重新绽放光彩
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