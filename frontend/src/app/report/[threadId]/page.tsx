"use client"

import { useEffect, useState } from "react"
import { ReportState } from "@/lib/report-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ReportPage({ params }: { params: { threadId: string } }) {
  const [reportState, setReportState] = useState<ReportState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const pollReport = async () => {
      try {
        const response = await fetch(`/api/report/${params.threadId}`)
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
          return
        }

        setReportState(data.state)
        
        // Update progress based on status
        switch (data.state.status) {
          case "planning":
            setProgress(25)
            break
          case "searching":
            setProgress(50)
            break
          case "writing":
            setProgress(75)
            break
          case "completed":
            setProgress(100)
            break
        }

        // Continue polling if not completed
        if (data.state.status !== "completed" && data.state.status !== "error") {
          setTimeout(pollReport, 2000)
        }
      } catch (err) {
        setError("Failed to fetch report status")
      }
    }

    pollReport()
  }, [params.threadId])

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>{error}</CardContent>
        </Card>
      </div>
    )
  }

  if (!reportState) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Generating Report</CardTitle>
            <CardDescription>Please wait while we generate your report...</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Report: {reportState.topic}</CardTitle>
          <CardDescription>Status: {reportState.status}</CardDescription>
        </CardHeader>
        <CardContent>
          {reportState.sections.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
              <div className="prose max-w-none">
                {section.content || <em>Content being generated...</em>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 