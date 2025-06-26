"use client"

interface ProgressBarProps {
  percent: number;
  className?: string;
}

export default function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* 百分比显示 */}
      <div className="flex justify-center mb-2">
        <span className="text-lg font-semibold text-purple-600">
          {percent}%
        </span>
      </div>
      
      {/* 进度条容器 */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        {/* 进度条填充 */}
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        >
          {/* 闪烁效果 */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
      
      {/* 进度描述 */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600">
          AI 正在为您的照片上色...
        </span>
      </div>
    </div>
  );
} 