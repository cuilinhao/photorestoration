/**
 * 解析 Replicate 日志中的进度百分比（DeOldify 专用）。
 * @param logs   从 prediction.logs 拿到的完整文本
 * @returns      0‒100 的整数；若没匹配到返回 null
 */
export function parseDeoldifyPercent(logs: string): number | null {
  console.log('🔍 [PARSE] Starting to parse logs, length:', logs?.length || 0);
  
  if (!logs) {
    console.log('⚠️ [PARSE] No logs provided');
    return null;
  }

  // 1. 把 \r 替成 \n，防止 tqdm 单行回车覆盖
  const normalizedLogs = logs.replace(/\r/g, "\n");
  console.log('📜 [PARSE] Normalized logs:', normalizedLogs);

  // 按行拆分，从下往上扫
  const lines = normalizedLogs.trim().split(/\n/).reverse();
  console.log('📊 [PARSE] Total lines:', lines.length);
  console.log('📊 [PARSE] Last 5 lines (reversed):', lines.slice(0, 5));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`🔍 [PARSE] Checking line ${i}: "${line}"`);

    // ① 匹配 " 16/100 " 或类似格式
    let m = line.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if (m) {
      const cur = Number(m[1]);
      const total = Number(m[2]) || 100;
      const percent = Math.min(100, Math.round((cur / total) * 100));
      console.log(`✅ [PARSE] Found progress format "cur/total": ${cur}/${total} = ${percent}%`);
      return percent;
    }

    // ② 匹配只带百分号 "46%"
    m = line.match(/(\d{1,3})\s*%/);
    if (m) {
      const percent = Math.min(100, Number(m[1]));
      console.log(`✅ [PARSE] Found percentage format: ${percent}%`);
      return percent;
    }

    // ③ 匹配含颜色控制符的 tqdm（去掉 \x1b[…]m）
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "");
    if (cleanLine !== line) {
      console.log(`🎨 [PARSE] Cleaned ANSI colors: "${line}" → "${cleanLine}"`);
    }
    
    m = cleanLine.match(/(\d{1,3})\/(\d{1,3})/);
    if (m) {
      const cur = Number(m[1]);
      const total = Number(m[2]) || 100;
      const percent = Math.min(100, Math.round((cur / total) * 100));
      console.log(`✅ [PARSE] Found progress in cleaned line: ${cur}/${total} = ${percent}%`);
      return percent;
    }

    // ④ 尝试匹配更宽松的数字模式 (for debugging)
    m = line.match(/(\d+).*?(\d+)/);
    if (m) {
      console.log(`🔍 [PARSE] Found numbers in line but no progress pattern: ${m[1]} and ${m[2]}`);
    }
  }

  console.log('❌ [PARSE] No progress pattern found in any line');
  return null; // 没找到
} 