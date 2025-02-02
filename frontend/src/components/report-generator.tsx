"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Copy, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

export function ReportGenerator() {
  const [topic, setTopic] = useState("")
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportType, setReportType] = useState("general")
  const [tone, setTone] = useState("formal")
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const { progress, connectWebSocket } = useReportStatus()

  // Track detailed generation progress
  const [generationState, setGenerationState] = useState({
    status: "idle",
    currentStep: "",
    searchResults: [],
    sections: [],
    error: null
  })

  const [showRawResponse, setShowRawResponse] = useState(false)
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)

  const handleGenerate = async () => {
    if (!topic) return
    
    setIsGenerating(true)
    setGenerationState({ ...generationState, status: "starting" })
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
      
      const data = await response.json()
      setRawApiResponse(data)
      console.log("Report generation started:", data)
      
    } catch (error) {
      console.error("Error generating report:", error)
      setGenerationState({
        ...generationState,
        status: "error",
        error: error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGenerationState({ ...generationState, status: "starting" })

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          reportType,
          tone
        })
      })

      if (!res.ok) throw new Error('Failed to start report generation')
      const data = await res.json()

      console.log("Report generation started:", data)
      connectWebSocket(data.threadId)

      toast({
        title: "Report Generation Started",
        description: "Your report is being generated. You'll see updates in real-time.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start report generation. Please try again.",
      })
    } finally {
      setIsGenerating(false)
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Configure your report settings and track progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your report topic..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="general">General Analysis</option>
                  <option value="technical">Technical Deep-Dive</option>
                  <option value="comparative">Comparative Analysis</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isGenerating || !topic}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : "Generate Report"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {generationState.status !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generation Progress
              <Badge variant={
                generationState.status === "completed" ? "success" :
                generationState.status === "error" ? "destructive" :
                "secondary"
              }>
                {generationState.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Step:</p>
              <p>{generationState.currentStep || "Initializing..."}</p>
            </div>

            {/* Raw API Response Section */}
            {rawApiResponse && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowRawResponse(!showRawResponse)}
                >
                  <span>Raw API Response</span>
                  {showRawResponse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showRawResponse && (
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(rawApiResponse, null, 2)}
                    </pre>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Search Results Section */}
            {generationState.searchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Search Results</p>
                  <Badge variant="secondary">{generationState.searchResults.length} results</Badge>
                </div>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  {generationState.searchResults.map((result, i) => (
                    <div key={i} className="mb-4 last:mb-0 p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium mb-2">{result.title}</p>
                      <p className="text-sm text-muted-foreground">{result.content}</p>
                      {result.url && (
                        <a 
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {generationState.error && (
              <div className="rounded-md bg-destructive/15 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                  <p className="text-sm text-destructive">{generationState.error}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 