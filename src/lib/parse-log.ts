/**
 * 从 Replicate 日志中解析进度百分比
 * 支持格式: "16/100", "46%", 带ANSI颜色控制符的tqdm进度条
 */
export function parseDeoldifyPercent(logs: string): number | null {
  if (!logs) return null

  // 标准化换行符并按行分割，从最后一行开始检查
  const lines = logs.replace(/\r/g, "\n").trim().split(/\n/).reverse()

  for (const line of lines) {
    // 匹配分数格式 "16/100"
    let match = line.match(/(\d{1,3})\s*\/\s*(\d{1,3})/)
    if (match) {
      const current = Number(match[1])
      const total = Number(match[2]) || 100
      return Math.min(100, Math.round((current / total) * 100))
    }

    // 匹配百分比格式 "46%"
    match = line.match(/(\d{1,3})\s*%/)
    if (match) {
      return Math.min(100, Number(match[1]))
    }

    // 清理ANSI颜色控制符后再匹配
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "")
    if (cleanLine !== line) {
      match = cleanLine.match(/(\d{1,3})\/(\d{1,3})/)
      if (match) {
        const current = Number(match[1])
        const total = Number(match[2]) || 100
        return Math.min(100, Math.round((current / total) * 100))
      }
    }
  }

  return null
} 