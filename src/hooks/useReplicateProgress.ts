import { useEffect, useState } from "react";
import { parseDeoldifyPercent } from "@/lib/parse-log";

interface ProgressState {
  percent: number;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  logs: string;
}

export function useReplicateProgress(id: string | null) {
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState<ProgressState["status"]>("starting");
  const [logs, setLogs] = useState("");

  useEffect(() => {
    console.log("⏳ [PROGRESS] useReplicateProgress effect triggered, id:", id);
    
    if (!id) {
      console.log("🔄 [PROGRESS] No ID provided, resetting state");
      // 重置状态
      setPercent(0);
      setStatus("starting");
      setLogs("");
      return;
    }

    console.log("🚀 [PROGRESS] Starting polling for prediction:", id);

    const timer = setInterval(async () => {
      console.log(`🔍 [PROGRESS] Polling prediction ${id}...`);
      
      try {
        const url = `/api/restore/${id}`;
        console.log("📡 [PROGRESS] Fetching URL:", url);
        
        const res = await fetch(url);
        console.log("📨 [PROGRESS] Response status:", res.status);
        
        if (!res.ok) {
          console.error("❌ [PROGRESS] Response not OK:", res.status, res.statusText);
          return;
        }
        
        const data = await res.json();
        console.log("📊 [PROGRESS] Full response data:", JSON.stringify(data, null, 2));
        console.log("📊 [PROGRESS] Status:", data.status);
        console.log("📊 [PROGRESS] Logs length:", data.logs?.length || 0);
        console.log("📊 [PROGRESS] Raw logs:", data.logs);

        setStatus(data.status);
        setLogs(data.logs || "");

        // 解析进度
        const p = parseDeoldifyPercent(data.logs ?? "");
        console.log("🔢 [PROGRESS] Parsed percent:", p);
        
        if (p !== null) {
          console.log("✅ [PROGRESS] Updating percent to:", p);
          setPercent(p);
        } else {
          console.log("⚠️ [PROGRESS] No progress found in logs, keeping current percent");
        }

        // 如果完成或失败，停止轮询
        if (data.status === "succeeded" || data.status === "failed" || data.status === "canceled") {
          console.log("🏁 [PROGRESS] Task completed, stopping polling. Final status:", data.status);
          clearInterval(timer);
          if (data.status === "succeeded") {
            console.log("🎉 [PROGRESS] Setting percent to 100%");
            setPercent(100);
          }
        }
      } catch (error) {
        console.error("💥 [PROGRESS] Failed to fetch progress:", error);
      }
    }, 4000); // 每4秒轮询一次

    return () => {
      console.log("🛑 [PROGRESS] Cleaning up polling timer for:", id);
      clearInterval(timer);
    };
  }, [id]);

  return { percent, status, logs };
} 