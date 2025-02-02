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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelConfig } from "@/components/model-config"
import { DEFAULT_CONFIG, type AppConfig } from "@/lib/config"

export function ReportGenerator() {
  const [topic, setTopic] = useState("")
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportType, setReportType] = useState("")
  const [tone, setTone] = useState("")
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const { progress, connectWebSocket } = useReportStatus()

  const handleGenerate = async () => {
    if (!topic) return
    
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          config,
          reportType: "general",
          tone: "formal"
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate report")
      }
      
      // Handle successful generation
      const data = await response.json()
      console.log("Report generation started:", data)
      
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

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
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          placeholder="Enter your report topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <ModelConfig
            plannerModel={config.plannerModel}
            writerModel={config.writerModel}
            onPlannerModelChange={(model) => setConfig({ ...config, plannerModel: model })}
            onWriterModelChange={(model) => setConfig({ ...config, writerModel: model })}
          />
        </TabsContent>
        <TabsContent value="advanced">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="queries">Number of Search Queries</Label>
              <Input
                id="queries"
                type="number"
                min={1}
                max={5}
                value={config.numberOfQueries}
                onChange={(e) => setConfig({ ...config, numberOfQueries: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Search Topic</Label>
              <Tabs defaultValue={config.tavilyTopic} onValueChange={(v: "general" | "news") => setConfig({ ...config, tavilyTopic: v })}>
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleGenerate} 
        disabled={!topic || isGenerating}
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
    </div>
  )
} 