"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useReportStatus } from "@/hooks/use-report-status"
import { Textarea } from "@/components/ui/textarea"
import { Section } from "@/lib/report-state"

export function ReportGenerator() {
  const [topic, setTopic] = useState("")
  const [reportType, setReportType] = useState("")
  const [tone, setTone] = useState("")
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const { progress, connectWebSocket } = useReportStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic,
          reportType,
          tone
        })
      })

      if (!res.ok) throw new Error('Failed to start report generation')
      
      const { threadId } = await res.json()
      connectWebSocket(threadId)
      
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated. You'll see updates in real-time.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start report generation. Please try again.",
        variant: "destructive"
      })
    }
  }

  const submitFeedback = async () => {
    if (!progress.threadId || !feedback) return
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: progress.threadId,
          feedback
        })
      })

      if (!res.ok) throw new Error('Failed to submit feedback')
      
      setFeedback("")
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been processed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderSection = (section: Section) => (
    <Card key={section.name} className="mb-4">
      <CardHeader>
        <CardTitle>{section.name}</CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {section.content ? (
          <div className="whitespace-pre-wrap">{section.content}</div>
        ) : (
          <div className="text-muted-foreground">Content being generated...</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Configure your report generation settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Report Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your report topic"
              disabled={progress.status !== "idle"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select 
              value={reportType} 
              onValueChange={setReportType}
              disabled={progress.status !== "idle"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Analysis</SelectItem>
                <SelectItem value="market">Market Research</SelectItem>
                <SelectItem value="performance">Performance Review</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Writing Tone</Label>
            <Select 
              value={tone} 
              onValueChange={setTone}
              disabled={progress.status !== "idle"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {progress.status === "awaiting_feedback" && (
            <div className="space-y-2">
              <Label>Provide Feedback</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback on the report structure..."
                className="min-h-[100px]"
              />
              <Button 
                type="button" 
                onClick={submitFeedback}
                disabled={!feedback}
              >
                Submit Feedback
              </Button>
            </div>
          )}

          {progress.status !== "idle" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generation Progress</Label>
                <Progress 
                  value={
                    progress.status === "completed" 
                      ? 100 
                      : ((progress.completedSections.length / (progress.sections.length || 1)) * 100)
                  } 
                  className="w-full" 
                />
              </div>

              <div className="space-y-4">
                {progress.sections.map(renderSection)}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={progress.status !== "idle" || !topic || !reportType || !tone}
          >
            {progress.status === "idle" ? "Generate Report" : "Generation in Progress..."}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 