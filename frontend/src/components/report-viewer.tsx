import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Share, FileText } from "lucide-react"
import { ReportState, Section } from "@/lib/report-state"

interface ReportViewerProps {
  report: ReportState
  onCopy?: () => void
  onDownload?: () => void
  onShare?: () => void
}

export function ReportViewer({ report, onCopy, onDownload, onShare }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState("content")

  const copyToClipboard = async () => {
    try {
      const text = report.sections.map(section => 
        `${section.name}\n${section.content}\n\n`
      ).join("")
      await navigator.clipboard.writeText(text)
      onCopy?.()
    } catch (error) {
      console.error("Failed to copy report:", error)
    }
  }

  const downloadReport = () => {
    try {
      const text = report.sections.map(section => 
        `${section.name}\n${section.content}\n\n`
      ).join("")
      
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.topic.replace(/[^a-z0-9]/gi, "_")}_report.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      onDownload?.()
    } catch (error) {
      console.error("Failed to download report:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{report.topic}</CardTitle>
            <CardDescription>
              Generated report with {report.sections.length} sections and {report.searchResults.length} search results
            </CardDescription>
          </div>
          <Badge variant={
            report.status === "completed" ? "success" :
            report.status === "error" ? "destructive" :
            "secondary"
          }>
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-4">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {report.sections.map((section, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
                  <div className="prose prose-sm max-w-none">
                    {section.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="research" className="mt-4">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {report.searchResults.map((result, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h4 className="font-medium mb-1">{result.title}</h4>
                  <p className="text-sm text-muted-foreground">{result.content}</p>
                  {result.url && (
                    <a 
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline mt-1 block"
                    >
                      Source
                    </a>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="metadata" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Report Type</h4>
                <p className="text-sm text-muted-foreground">
                  {report.metadata?.reportType || "General"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Tone</h4>
                <p className="text-sm text-muted-foreground">
                  {report.metadata?.tone || "Formal"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Generation Time</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        <Button variant="default" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </CardFooter>
    </Card>
  )
} 