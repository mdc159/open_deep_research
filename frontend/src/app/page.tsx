"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/report-generator"
import { useRouter } from "next/navigation"

export default function Home() {
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Report mAIstro</h1>
        </div>
      </header>
      
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Generate New Report</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Configure your report settings and choose AI models for generation.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ReportGenerator />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>You have generated 12 reports this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add recent reports list here */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Credits</CardTitle>
                  <CardDescription>Your current usage and limits</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add credits info here */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common report generation tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">Upload Data</Button>
                  <Button className="w-full" variant="outline">Schedule Report</Button>
                  <Button className="w-full" variant="outline">View Templates</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {/* Reports list will go here */}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Settings form will go here */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
