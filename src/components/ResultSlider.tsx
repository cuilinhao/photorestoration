"use client"

import ReactCompareImage from "react-compare-image"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw } from "lucide-react"

interface ResultSliderProps {
  originalImage: string
  colorizedImage: string
  onDownload: () => void
  onTryAgain: () => void
}

export default function ResultSlider({
  originalImage,
  colorizedImage,
  onDownload,
  onTryAgain
}: ResultSliderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Result comparison slider */}
      <div className="aspect-[3/2] w-full">
        <ReactCompareImage
          leftImage={originalImage}
          rightImage={colorizedImage}
          sliderLineColor="#7C3AED"
          sliderLineWidth={4}
          handle={
            <div className="w-8 h-8 rounded-full bg-purple-600 border-4 border-white shadow-lg" />
          }
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onDownload}
          className="h-12 px-8 text-lg rounded-xl bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
        >
          <Download size={20} />
          下载高清图
        </Button>

        <Button
          onClick={onTryAgain}
          variant="outline"
          className="h-12 px-8 text-lg rounded-xl border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
        >
          <RotateCcw size={20} />
          再来一张
        </Button>
      </div>

      {/* Result info */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-900">
          ✨ AI 上色完成！
        </p>
        <p className="text-sm text-muted-foreground">
          拖动滑块查看前后对比效果
        </p>
      </div>
    </div>
  )
}
