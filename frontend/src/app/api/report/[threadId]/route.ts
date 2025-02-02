import { NextResponse } from "next/server"

// In-memory store for report states (in production, use a proper database)
const reportStates = new Map()

export function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const state = reportStates.get(params.threadId)
    
    if (!state) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ state })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch report status" },
      { status: 500 }
    )
  }
}

// Helper function to update report state
export function updateReportState(threadId: string, state: any) {
  reportStates.set(threadId, state)
} 