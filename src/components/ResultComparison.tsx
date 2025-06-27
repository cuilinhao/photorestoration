"use client"

import { Button } from "@/components/ui/button"
import { Download, RotateCcw } from "lucide-react"
import { useState } from "react"
import ReactCompareImage from "react-compare-image"
import { useLanguage } from "@/contexts/LanguageContext"

interface ResultComparisonProps {
  originalImage: string
  colorizedImage: string
  onDownload: () => void
  onTryAgain: () => void
}

export default function ResultComparison({
  originalImage,
  colorizedImage,
  onDownload,
  onTryAgain
}: ResultComparisonProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side')
  const { t } = useLanguage()

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 视图切换按钮 */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('result.sideBySide')}
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('result.slider')}
          </button>
        </div>
      </div>

      {/* 并排对比视图 */}
      {viewMode === 'side-by-side' && (
        <div className="space-y-6">
          {/* 桌面端：左右并排 */}
          <div className="hidden md:grid grid-cols-2 gap-8">
            {/* 原图 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-8 bg-gray-400 rounded"></div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {t('result.original')}
                </h3>
                <div className="h-1 w-8 bg-gray-400 rounded"></div>
              </div>
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-xl border-2 border-gray-200 transition-transform hover:scale-[1.02]">
                <img
                  src={originalImage}
                  alt="原始照片"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
                  {t('result.blackWhite')}
                </p>
              </div>
            </div>

            {/* 上色图 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-8 bg-purple-400 rounded"></div>
                <h3 className="text-lg font-semibold text-purple-600">
                  {t('result.aiResult')}
                </h3>
                <div className="h-1 w-8 bg-purple-400 rounded"></div>
              </div>
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-xl border-2 border-purple-200 transition-transform hover:scale-[1.02]">
                <img
                  src={colorizedImage}
                  alt="AI上色结果"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full inline-block">
                  {t('result.colorRestored')}
                </p>
              </div>
            </div>
          </div>

          {/* 移动端：上下排列 */}
          <div className="md:hidden space-y-8">
            {/* 原图 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-gray-700">
                {t('result.original')}
              </h3>
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-xl border-2 border-gray-200">
                <img
                  src={originalImage}
                  alt="原始照片"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block mx-auto">
                {t('result.blackWhite')}
              </p>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-full"></div>
              <div className="px-4 text-purple-600 font-medium">VS</div>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-full"></div>
            </div>

            {/* 上色图 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-purple-600">
                {t('result.aiResult')}
              </h3>
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-xl border-2 border-purple-200">
                <img
                  src={colorizedImage}
                  alt="AI上色结果"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-center text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full inline-block mx-auto">
                {t('result.colorRestored')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 滑块对比视图 */}
      {viewMode === 'slider' && (
        <div className="space-y-4">
          <div className="aspect-[3/2] w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
            <ReactCompareImage
              leftImage={originalImage}
              rightImage={colorizedImage}
              sliderLineColor="#7C3AED"
              sliderLineWidth={4}
              handle={
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#7C3AED',
                    border: '4px solid white',
                    borderRadius: '50%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                />
              }
            />
          </div>
          <p className="text-sm text-center text-gray-500">
            {t('result.dragSlider')}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          onClick={onDownload}
          className="h-12 px-8 text-lg rounded-xl bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
        >
          <Download size={20} />
          {t('result.download')}
        </Button>

        <Button
          onClick={onTryAgain}
          variant="outline"
          className="h-12 px-8 text-lg rounded-xl border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
        >
          <RotateCcw size={20} />
          {t('result.tryAgain')}
        </Button>
      </div>

      {/* 结果信息 */}
      <div className="text-center space-y-2 pt-4 border-t">
        <p className="text-xl font-semibold text-gray-900">
          {t('result.completed')}
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {viewMode === 'side-by-side' 
            ? t('result.sideBySeideDesc')
            : t('result.sliderDesc')
          }
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 pt-3">
                     <div className="flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
             <span>{t('result.smartRestore')}</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
             <span>{t('result.hdColor')}</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
             <span>{t('result.fluxPowered')}</span>
           </div>
        </div>
      </div>
    </div>
  )
} 