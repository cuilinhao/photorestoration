"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

// 照片对比数据
const photoComparisons = [
  {
    id: 1,
    beforeImage: "/demo/1-0.jpg",
    afterImage: "/demo/1-1.jpg",
    title: "家庭老照片修复",
    description: "30年代老照片重获新生",
    testimonial: "没想到爷爷的老照片能修复得这么好，细节和色彩都很自然！"
  },
  {
    id: 2,
    beforeImage: "/demo/2-0.jpg",
    afterImage: "/demo/2-1.jpg",
    title: "人像照片修复",
    description: "褪色人像照片完美复原",
    testimonial: "AI技术真的很神奇，妈妈年轻时的照片又变得清晰鲜活了。"
  },
  {
    id: 3,
    beforeImage: "/demo/3-0.jpg",
    afterImage: "/demo/3-1.jpg",
    title: "历史照片修复",
    description: "珍贵历史瞬间重现光彩",
    testimonial: "这张珍贵的历史照片修复后效果超出预期，真的太棒了！"
  },
  {
    id: 4,
    beforeImage: "/demo/4-0.jpg",
    afterImage: "/demo/4-1.jpg",
    title: "风景照片修复",
    description: "老风景照重现昔日风采",
    testimonial: "童年时拍的风景照修复后色彩丰富，仿佛回到了那个美好的时光。"
  },
  {
    id: 5,
    beforeImage: "/demo/old_photo_bw.jpg",
    afterImage: "/demo/old_photo_color.jpg",
    title: "经典老照片修复",
    description: "经典黑白照片完美上色",
    testimonial: "这种经典的黑白照片修复效果真是令人惊艳，FLUX技术太强大了！"
  }
]

export default function TestimonialsCarousel() {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  const animationRef = useRef<number>()

  // 持续滚动动画
  const continuousScroll = useCallback(() => {
    if (!containerRef.current || isPaused || !isAutoPlaying) return

    const container = containerRef.current
    const scrollSpeed = 0.5 // 滚动速度，数值越大滚动越快
    
    scrollPositionRef.current += scrollSpeed
    
    // 如果滚动到末尾，重置到开始位置实现无限滚动
    const maxScroll = container.scrollWidth - container.clientWidth
    if (scrollPositionRef.current >= maxScroll) {
      scrollPositionRef.current = 0
    }
    
    container.scrollLeft = scrollPositionRef.current
    
    animationRef.current = requestAnimationFrame(continuousScroll)
  }, [isPaused, isAutoPlaying])

  // 启动持续滚动
  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      animationRef.current = requestAnimationFrame(continuousScroll)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAutoPlaying, isPaused, continuousScroll])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleManualScroll(-200)
      } else if (event.key === 'ArrowRight') {
        handleManualScroll(200)
      } else if (event.key === ' ') {
        event.preventDefault()
        setIsAutoPlaying(!isAutoPlaying)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAutoPlaying])

  // 手动滚动
  const handleManualScroll = (direction: number) => {
    if (containerRef.current) {
      setIsAutoPlaying(false)
      scrollPositionRef.current = containerRef.current.scrollLeft + direction
      containerRef.current.scrollTo({
        left: scrollPositionRef.current,
        behavior: 'smooth'
      })
    }
  }

  // 鼠标事件处理
  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  // 创建双倍数据用于无限滚动效果
  const duplicatedComparisons = [...photoComparisons, ...photoComparisons]

  return (
    <section className="py-24 overflow-hidden">
      <div className="container">
        {/* 标题部分 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            真实用户 <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">修复案例</span>
          </h2>
          <p className="text-muted-foreground lg:text-xl max-w-3xl mx-auto">
            看看其他用户使用我们的 <strong>FLUX AI</strong> 技术修复老照片的神奇效果
          </p>
        </div>
      </div>

      {/* 全屏轮播容器 */}
      <div className="relative w-full">
        {/* 水平滚动容器 */}
        <div
          ref={containerRef}
          className="flex overflow-x-hidden scrollbar-hide"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedComparisons.map((comparison, index) => (
            <div
              key={`${comparison.id}-${index}`}
              className="flex-none w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] px-3"
            >
              <div className="bg-card rounded-3xl border shadow-xl p-6 md:p-8 mx-auto h-full transition-all duration-300 hover:shadow-2xl">
                {/* 照片对比展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  {/* 修复前 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-muted-foreground/30"></div>
                      <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                        📷 修复前
                      </h3>
                      <div className="h-px w-8 bg-muted-foreground/30"></div>
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border group">
                      <img
                        src={comparison.beforeImage}
                        alt="修复前"
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        draggable={false}
                      />
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        黑白老照片
                      </span>
                    </div>
                  </div>

                  {/* 修复后 */}
                  <div className="space-y-4 relative">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-primary/30"></div>
                      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        ✨ 修复后
                      </h3>
                      <div className="h-px w-8 bg-primary/30"></div>
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-primary/20 group relative">
                      <img
                        src={comparison.afterImage}
                        alt="修复后"
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        draggable={false}
                      />
                      <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                        FLUX AI
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        AI 修复上色
                      </span>
                    </div>
                  </div>
                </div>

                {/* 用户评价 */}
                <div className="text-center space-y-4 mt-8">
                  <Quote className="w-8 h-8 text-primary/60 mx-auto" />
                  <blockquote className="text-sm md:text-base text-foreground font-medium italic leading-relaxed">
                    "{comparison.testimonial}"
                  </blockquote>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">{comparison.title}</h4>
                    <p className="text-muted-foreground text-sm">{comparison.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 导航按钮 */}
        <Button
          onClick={() => handleManualScroll(-200)}
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background z-10 transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          onClick={() => handleManualScroll(200)}
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background z-10 transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* 底部控制区域 */}
      <div className="container mt-8">
        {/* 自动播放控制 */}
        <div className="flex flex-col items-center space-y-3">
          <Button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isAutoPlaying ? "⏸️ 暂停自动滚动" : "▶️ 开启自动滚动"}
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            悬停暂停滚动，使用左右箭头键快速浏览，空格键暂停/播放
          </p>
        </div>
      </div>

      {/* 隐藏滚动条的CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
} 