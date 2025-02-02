"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReportState } from "@/lib/report-state"
import { ReportViewer } from "@/components/report-viewer"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ReportPage({ params }: { params: { threadId: string } }) {
  const [reportState, setReportState] = useState<ReportState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const pollReport = async () => {
    try {
      const response = await fetch(`/api/report/${params.threadId}`)
      if (!response.ok) throw new Error('Failed to fetch report status')
      
      const data = await response.json()
      setReportState(data.state)

      // Update progress based on status
      switch (data.state.status) {
        case "planning":
          setProgress(20)
          break
        case "searching":
          setProgress(40)
          break
        case "writing":
          setProgress(60)
          break
        case "reviewing":
          setProgress(80)
          break
        case "completed":
          setProgress(100)
          toast({
            title: "Report Generation Complete",
            description: "Your report is ready to view.",
          })
          break
        case "error":
          setError(data.state.error || "An error occurred")
          toast({
            variant: "destructive",
            title: "Error",
            description: data.state.error || "Failed to generate report",
          })
          break
      }

      // Continue polling if not complete
      if (data.state.status !== "completed" && data.state.status !== "error") {
        setTimeout(pollReport, 2000)
      }
    } catch (error) {
      setError("Failed to fetch report status")
      console.error("Error polling report:", error)
    }
  }

  useEffect(() => {
    pollReport()
  }, [])

  if (!reportState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Report</CardTitle>
          <CardDescription>Please wait while we fetch your report...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (reportState.status !== "completed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generating Report</CardTitle>
          <CardDescription>
            {reportState.status === "planning" && "Planning report structure..."}
            {reportState.status === "searching" && "Researching topic..."}
            {reportState.status === "writing" && "Writing report sections..."}
            {reportState.status === "reviewing" && "Reviewing and finalizing..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            {progress}% complete
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ReportViewer 
      report={reportState}
      onCopy={() => {
        toast({
          title: "Report Copied",
          description: "Report content has been copied to clipboard.",
        })
      }}
      onDownload={() => {
        toast({
          title: "Report Downloaded",
          description: "Report has been downloaded as a text file.",
        })
      }}
    />
  )
} 