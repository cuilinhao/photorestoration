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
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-between bg-gradient-to-b from-zinc-50 to-white px-6 lg:px-12">
      {/* Left side - Text content */}
      <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            ColorOld
          </h1>
          <h2 className="text-2xl lg:text-3xl font-bold text-purple-600">
            老照片 AI 上色
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg">
            60 秒内让灰阶/褪色照片变 2K 彩照，AI 智能上色技术让珍贵回忆重新焕发光彩
          </p>
        </div>

        <Button
          onClick={scrollToUploader}
          className="h-12 px-8 text-lg rounded-xl bg-purple-600 text-white hover:bg-purple-700"
        >
          立即尝试
        </Button>
      </div>

      {/* Right side - Demo slider */}
      <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
        <div className="aspect-[3/2] lg:aspect-[3/2] max-w-lg mx-auto">
          <ReactCompareImage
            leftImage="/demo/old_photo_bw.jpg"
            rightImage="/demo/old_photo_color.jpg"
            sliderLineColor="#7C3AED"
            sliderLineWidth={4}
            handle={
              <div className="w-8 h-8 rounded-full bg-purple-600 border-4 border-white shadow-lg" />
            }
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          拖动滑块查看效果对比
        </p>
      </div>
    </div>
  )
}
