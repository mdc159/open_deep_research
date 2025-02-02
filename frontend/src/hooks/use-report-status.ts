"use client"

import { useState, useEffect } from "react"
import { ReportProgress } from "@/lib/report-state"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws"

export function useReportStatus() {
  const [progress, setProgress] = useState<ReportProgress>({
    status: "idle",
    sections: [],
    completedSections: []
  })
  const [socket, setSocket] = useState<WebSocket | null>(null)

  const connectWebSocket = (threadId: string) => {
    const ws = new WebSocket(`${WS_URL}/${threadId}`)

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ReportProgress
      setProgress(data)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setProgress(prev => ({
        ...prev,
        status: "error",
        error: "WebSocket connection failed"
      }))
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    setSocket(ws)
  }

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  return {
    progress,
    connectWebSocket,
    disconnectWebSocket: () => socket?.close()
  }
} 