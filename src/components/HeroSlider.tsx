"use client"

import ReactCompareImage from "react-compare-image"
import { Button } from "@/components/ui/button"

export default function HeroSlider() {
  const scrollToUploader = () => {
    const uploaderElement = document.getElementById('uploader')
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between bg-gradient-to-b from-zinc-50 to-white px-6 lg:px-12 py-12 lg:py-16">
      {/* Left side - Text content */}
      <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
        <div className="space-y-3">
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
            ColorOld
          </h1>
          <h2 className="text-xl lg:text-2xl font-bold text-purple-600">
            老照片 AI 修复与上色
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-lg">
            60 秒内让灰阶/褪色照片变 2K 彩照，FLUX AI 智能修复技术让珍贵回忆重新焕发光彩
          </p>
        </div>

        <Button
          onClick={scrollToUploader}
          className="h-11 px-6 text-base rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          🚀 立即尝试
        </Button>
      </div>

      {/* Right side - Demo slider */}
      <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
        <div className="aspect-[4/3] max-w-md mx-auto">
          <ReactCompareImage
            leftImage="/demo/old_photo_bw.jpg"
            rightImage="/demo/old_photo_color.jpg"
            sliderLineColor="#7C3AED"
            sliderLineWidth={3}
            handle={
              <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white shadow-lg" />
            }
          />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          👆 拖动滑块查看修复效果
        </p>
      </div>
    </div>
  )
}
