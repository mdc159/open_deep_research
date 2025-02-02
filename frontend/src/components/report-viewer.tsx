import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ReportViewerProps {
  report: {
    id: string
    title: string
    createdAt: Date
    status: "completed" | "failed" | "processing"
    type: string
    content?: string
    error?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportViewer({ report, open, onOpenChange }: ReportViewerProps) {
  const handleCopy = () => {
    if (report.content) {
      navigator.clipboard.writeText(report.content)
    }
  }

  const handleDownload = () => {
    if (report.content) {
      const blob = new Blob([report.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title}-${format(report.createdAt, "yyyy-MM-dd")}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>{report.title}</DialogTitle>
              <DialogDescription>
                Generated on {format(report.createdAt, "MMMM d, yyyy")} • {report.type}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!report.content}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy report</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={!report.content}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download report</span>
              </Button>
            </div>
          </div>
          <div className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit",
            report.status === "completed" && "bg-green-500/20 text-green-500",
            report.status === "processing" && "bg-blue-500/20 text-blue-500",
            report.status === "failed" && "bg-red-500/20 text-red-500"
          )}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4">
          {report.status === "completed" && report.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {report.content}
              </pre>
            </div>
          )}
          {report.status === "processing" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Generating report...</p>
              </div>
            </div>
          )}
          {report.status === "failed" && report.error && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500">
              <p className="text-sm">{report.error}</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 