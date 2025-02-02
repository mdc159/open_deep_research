import { NextResponse } from "next/server"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { getConfig } from "@/lib/config"
import { ReportState, Section } from "@/lib/report-state"

async function generateReportPlan(state: ReportState): Promise<Partial<ReportState>> {
  const config = getConfig()
  let llm;
  
  if (config.plannerModel === "deepseek-reasoner") {
    llm = new ChatOpenAI({
      modelName: "deepseek-reasoner",
      configuration: { baseURL: "https://api.deepseek.com/v1" },
      apiKey: config.deepseekApiKey,
      temperature: 0
    })
  } else if (config.plannerModel === "o3-mini") {
    llm = new ChatOpenAI({
      modelName: "o3-mini",
      temperature: 0
    })
  } else {
    llm = new ChatAnthropic({
      modelName: "claude-3-sonnet-20240620",
      temperature: 0
    })
  }
  
  // Generate initial structure
  const planPrompt = `
    ${config.reportStructure}
    Topic: ${state.topic}
    ${state.feedback ? `Previous feedback: ${state.feedback}` : ""}
    Generate a detailed report structure with sections.
  `
  
  const plan = await llm.invoke(planPrompt)
  
  // Generate search queries for research
  const searchPrompt = `Based on this report plan, generate ${config.numberOfQueries} search queries for research:
    ${plan.content}`
  
  const queries = await llm.invoke(searchPrompt)
  const searchTool = new TavilySearchResults()
  
  // Perform searches in parallel
  const searchResults = await Promise.all(
    (queries.content as string).split("\n")
      .filter((q: string) => q.trim())
      .map((query: string) => searchTool.invoke({ query }))
  )

  // Process results into sections
  const sections: Section[] = (plan.content as string)
    .split("\n")
    .filter((line: string) => line.match(/^\d+\./))
    .map((line: string) => ({
      name: line.replace(/^\d+\.\s*/, "").split("(")[0].trim(),
      description: line,
      research: !line.includes("(no research needed)"),
      content: ""
    }))

  return { 
    sections, 
    searchResults,
    status: "awaiting_feedback"
  }
}

async function buildSections(state: ReportState): Promise<Partial<ReportState>> {
  const config = getConfig()
  const { sections, searchResults } = state
  
  let writer;
  if (config.writerModel === "o3-mini") {
    writer = new ChatOpenAI({
      modelName: "o3-mini",
      temperature: 0
    })
  } else {
    writer = new ChatAnthropic({
      modelName: "claude-3-sonnet-20240620",
      temperature: 0
    })
  }
  
  const completedSections = await Promise.all(
    sections.map(async (section, index) => {
      if (!section.research) {
        const content = await writer.invoke(
          `Write the ${section.name} section for the report. Keep it concise and relevant.`
        )
        return { ...section, content: content.content as string }
      }

      const relevantResults = searchResults[index % searchResults.length]
      const content = await writer.invoke(
        `Write the ${section.name} section using this research: ${JSON.stringify(relevantResults)}`
      )
      return { ...section, content: content.content as string }
    })
  )

  return {
    completedSections,
    status: "completed"
  }
}

export async function POST(req: Request) {
  try {
    const { topic, reportType, tone } = await req.json()
    const threadId = crypto.randomUUID()
    
    const initialState: ReportState = {
      topic,
      sections: [],
      completedSections: [],
      searchResults: [],
      status: "planning",
      threadId,
      metadata: { reportType, tone }
    }

    // Start async processing
    const ws = new WebSocket(`ws://localhost:3000/ws/${threadId}`)
    
    // Initial plan generation
    const planUpdate = await generateReportPlan(initialState)
    const stateAfterPlan = { ...initialState, ...planUpdate }
    
    ws.send(JSON.stringify(stateAfterPlan))

    // Set up WebSocket message handler for feedback
    ws.onmessage = async (event) => {
      const feedback = JSON.parse(event.data)
      
      if (feedback.accept_report_plan === false) {
        // Regenerate plan with feedback
        const newPlanUpdate = await generateReportPlan({
          ...stateAfterPlan,
          feedback: feedback.feedback_on_report_plan
        })
        ws.send(JSON.stringify({ ...stateAfterPlan, ...newPlanUpdate }))
      } else {
        // Build sections
        const sectionsUpdate = await buildSections(stateAfterPlan)
        ws.send(JSON.stringify({ ...stateAfterPlan, ...sectionsUpdate }))
        ws.close()
      }
    }

    return NextResponse.json({ threadId })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { error: "Failed to start report generation" },
      { status: 500 }
    )
  }
} 