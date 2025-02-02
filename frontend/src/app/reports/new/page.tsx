"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewReportPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement report generation
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push("/reports")
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Report</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Enter the details for your new AI-powered report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your report"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Research</SelectItem>
                  <SelectItem value="competition">Competition Analysis</SelectItem>
                  <SelectItem value="strategy">Strategy Review</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Research Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to research..."
                className="min-h-[100px]"
                required
              />
              <p className="text-sm text-muted-foreground">
                Be specific about what you want to analyze. Include key points, time periods, or specific aspects you want to focus on.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sources">Additional Sources (Optional)</Label>
              <Textarea
                id="sources"
                placeholder="Add URLs or references to include in the research..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Add specific sources you want to include in the research. Separate multiple URLs with new lines.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/reports">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Report
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
} 