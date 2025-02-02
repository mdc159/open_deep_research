import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { threadId, feedback } = await req.json()
    
    if (!threadId || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update the LangGraph state with feedback
    // This would typically:
    // 1. Get the current state for the threadId
    // 2. Update the state with:
    //    - feedback_on_report_plan: feedback
    //    - accept_report_plan: false
    // 3. Resume the LangGraph execution
    // 4. Send updates via WebSocket

    // For now, we'll simulate the state update
    const ws = new WebSocket(`ws://localhost:3000/ws/${threadId}`)
    ws.onopen = () => {
      ws.send(JSON.stringify({
        status: "planning",
        threadId,
        sections: [],
        completed_sections: [],
        feedback_on_report_plan: feedback,
        accept_report_plan: false
      }))
      ws.close()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    )
  }
} 