"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/report-generator"
import { useRouter } from "next/navigation"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ArrowRight, Brain, Cog, FileText, Workflow, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

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
      color: "blue",
    },
    {
      title: "AI Research",
      description: "Intelligent web research using Tavily API for accurate and relevant information gathering.",
      icon: Brain,
      color: "purple",
    },
    {
      title: "Customizable",
      description: "Fine-tune report generation with configurable parameters for tone, style, and depth of research.",
      icon: Cog,
      color: "green",
    },
    {
      title: "Rich Reports",
      description: "Generate comprehensive reports with citations, summaries, and structured sections.",
      icon: FileText,
      color: "orange",
    },
  ]

  const pipeline = [
    {
      title: "Topic Analysis",
      description: "LangGraph analyzes your topic to understand key areas to research and structure the report outline.",
    },
    {
      title: "Research Phase",
      description: "Tavily API performs targeted web research to gather relevant, high-quality information.",
    },
    {
      title: "Content Generation",
      description: "AI processes research results and generates structured content following your specifications.",
    },
    {
      title: "Review & Refinement",
      description: "Content is reviewed for accuracy, coherence, and style consistency.",
    },
    {
      title: "Final Formatting",
      description: "Report is formatted with proper citations, sections, and styling.",
    },
  ]

  return (
    <TracingBeam className="px-6">
      <div className="space-y-12">
        <motion.div 
          className="space-y-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Welcome to Report mAIstro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate comprehensive, research-backed reports powered by AI and LangGraph
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg bg-${feature.color}-500/10 p-2 group-hover:bg-${feature.color}-500/20 transition-colors`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>How It Works</CardTitle>
            </div>
            <CardDescription>
              Understanding the LangGraph-powered report generation process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              {pipeline.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex-none">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Configuration Options</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Report Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• General Analysis</li>
                    <li>• Technical Deep-Dive</li>
                    <li>• Academic Research</li>
                    <li>• Market Research</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Style & Tone</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Professional</li>
                    <li>• Academic</li>
                    <li>• Conversational</li>
                    <li>• Technical</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link href="/reports/new">
            <Button size="lg" className="gap-2 group">
              Generate Your First Report
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </TracingBeam>
  )
}
