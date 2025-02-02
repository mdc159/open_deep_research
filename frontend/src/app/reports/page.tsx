"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Plus, FileText, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Temporary type for reports
interface Report {
  id: string
  title: string
  createdAt: Date
  status: "completed" | "failed" | "processing"
  type: string
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Temporary demo data
  const reports: Report[] = [
    {
      id: "1",
      title: "Q4 2023 Market Analysis",
      createdAt: new Date("2024-01-15"),
      status: "completed",
      type: "Market Research"
    },
    {
      id: "2",
      title: "Competitor Analysis Report",
      createdAt: new Date("2024-01-14"),
      status: "completed",
      type: "Competition"
    },
    {
      id: "3",
      title: "Product Strategy Review",
      createdAt: new Date("2024-01-13"),
      status: "processing",
      type: "Strategy"
    }
  ]

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Link href="/reports/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{report.title}</span>
                  </div>
                </TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{format(report.createdAt, "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    report.status === "completed" && "bg-green-500/20 text-green-500",
                    report.status === "processing" && "bg-blue-500/20 text-blue-500",
                    report.status === "failed" && "bg-red-500/20 text-red-500"
                  )}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 