"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/report-generator"
import { useRouter } from "next/navigation"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ArrowRight, Brain, Cog, FileText, Workflow } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  
  const handleGenerateReport = async (data: any) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Navigate to the report page
      router.push(`/report/${result.threadId}`)
    } catch (error) {
      console.error("Failed to generate report:", error)
      // Handle error (show toast, etc)
    }
  }

  const features = [
    {
      title: "LangGraph Powered",
      description: "Advanced report generation using LangGraph for structured, multi-step processing with feedback loops and error handling.",
      icon: Workflow,
    },
    {
      title: "AI Research",
      description: "Intelligent web research using Tavily API for accurate and relevant information gathering.",
      icon: Brain,
    },
    {
      title: "Customizable",
      description: "Fine-tune report generation with configurable parameters for tone, style, and depth of research.",
      icon: Cog,
    },
    {
      title: "Rich Reports",
      description: "Generate comprehensive reports with citations, summaries, and structured sections.",
      icon: FileText,
    },
  ]

  return (
    <TracingBeam className="px-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Report mAIstro</h1>
          <p className="text-lg text-muted-foreground">
            Generate comprehensive, research-backed reports powered by AI and LangGraph
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the report generation process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">1. LangGraph Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Reports are generated using a sophisticated LangGraph pipeline that breaks down the process into manageable steps:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                <li>Topic Analysis and Planning</li>
                <li>Research Phase with Tavily API</li>
                <li>Content Generation and Structuring</li>
                <li>Review and Refinement</li>
                <li>Final Formatting and Citations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">2. Configuration Options</h3>
              <p className="text-sm text-muted-foreground">
                Customize your report generation with various parameters:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                <li>Report Type (General, Technical, Academic)</li>
                <li>Writing Style and Tone</li>
                <li>Research Depth and Sources</li>
                <li>Section Organization</li>
                <li>Citation Style</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/reports/new">
            <Button size="lg" className="gap-2">
              Generate Your First Report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </TracingBeam>
  )
}
