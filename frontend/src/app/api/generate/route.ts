import { NextResponse } from "next/server"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { getConfig } from "@/lib/config"
import { ReportState, Section } from "@/lib/report-state"

async function generateReportPlan(state: ReportState): Promise<Partial<ReportState>> {
  console.log("🚀 Starting report plan generation for topic:", state.topic)
  const config = getConfig()
  console.log("📝 Using configuration:", {
    plannerModel: config.plannerModel,
    numberOfQueries: config.numberOfQueries,
    tavilyTopic: config.tavilyTopic,
    tavilyDays: config.tavilyDays
  })
  
  let llm: BaseChatModel;
  
  try {
    // Configure planner model based on selection
    if (config.plannerModel.startsWith("deepseek")) {
      console.log("🤖 Initializing Deepseek model for planning")
      llm = new ChatOpenAI({
        modelName: config.plannerModel,
        configuration: { baseURL: "https://api.deepseek.com/v1" },
        apiKey: config.deepseekApiKey,
        temperature: 0
      })
    } else if (config.plannerModel.startsWith("o")) {
      console.log("🤖 Initializing OpenAI model for planning")
      const modelMap: Record<string, string> = {
        "o1": "o1-2024-12-17",
        "o1-mini": "o1-mini-2024-09-12",
        "o3-mini": "o3-mini-2025-01-31"
      }
      llm = new ChatOpenAI({
        modelName: modelMap[config.plannerModel] || "o3-mini-2025-01-31",
        apiKey: process.env.OPENAI_API_KEY
      })
    } else {
      console.log("🤖 Initializing Claude model for planning")
      llm = new ChatAnthropic({
        modelName: config.plannerModel,
        apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
        temperature: 0
      })
    }
    
    // Generate initial structure
    console.log("📋 Generating report structure...")
    const planPrompt = `
      ${config.reportStructure}
      Topic: ${state.topic}
      ${state.feedback ? `Previous feedback: ${state.feedback}` : ""}
      Generate a detailed report structure with sections.
    `
    
    const plan = await llm.invoke(planPrompt)
    console.log("✅ Generated plan:", plan.content)
    
    // Generate search queries for research
    console.log("🔍 Generating search queries...")
    const searchPrompt = `Based on this report plan, generate ${config.numberOfQueries} search queries for research:
      ${plan.content}`
    
    const queries = await llm.invoke(searchPrompt)
    console.log("✅ Generated queries:", queries.content)
    
    console.log("🌐 Initializing Tavily search...")
    const searchTool = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 3,
      topic: config.tavilyTopic,
      days: config.tavilyDays
    })
    
    // Perform searches in parallel
    console.log("🔎 Executing searches...")
    const searchQueries = (queries.content as string)
      .split("\n")
      .filter((q: string) => q.trim())
      .map((q: string) => q
        // Remove numbering (e.g., "1.", "2.")
        .replace(/^\d+\.\s*/, '')
        // Remove quotes
        .replace(/["']/g, '')
        .trim()
      )
    console.log("Search queries to execute:", searchQueries)
    
    const searchResults = await Promise.all(
      searchQueries.map((query: string) => searchTool.invoke({ query }))
    )
    console.log("✅ Search results received:", searchResults.length, "results")
    
    // Process results into sections
    console.log("📑 Processing sections...")
    const sections: Section[] = (plan.content as string)
      .split("\n")
      .filter((line: string) => line.match(/^\d+\./))
      .map((line: string) => ({
        name: line.replace(/^\d+\.\s*/, "").split("(")[0].trim(),
        description: line,
        research: !line.includes("(no research needed)"),
        content: ""
      }))
    console.log("✅ Processed sections:", sections.length, "sections")

    return { 
      sections, 
      searchResults,
      status: "awaiting_feedback"
    }
  } catch (error) {
    console.error("❌ Error in generateReportPlan:", error)
    throw error
  }
}

async function buildSections(state: ReportState): Promise<Partial<ReportState>> {
  console.log("🏗️ Starting section building...")
  const config = getConfig()
  const { sections, searchResults } = state
  
  console.log("📝 Using configuration:", {
    writerModel: config.writerModel,
    numberOfSections: sections.length,
    searchResults: searchResults.length
  })
  
  let writer: BaseChatModel;
  try {
    // Configure writer model based on selection
    if (config.writerModel.startsWith("deepseek")) {
      console.log("🤖 Initializing Deepseek model for writing")
      writer = new ChatOpenAI({
        modelName: config.writerModel,
        configuration: { baseURL: "https://api.deepseek.com/v1" },
        apiKey: config.deepseekApiKey,
        temperature: 0
      })
    } else if (config.writerModel.startsWith("o")) {
      console.log("🤖 Initializing OpenAI model for writing")
      writer = new ChatOpenAI({
        modelName: config.writerModel,
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0
      })
    } else {
      console.log("🤖 Initializing Claude model for writing")
      writer = new ChatAnthropic({
        modelName: config.writerModel,
        apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
        temperature: 0
      })
    }
    
    console.log("📝 Starting section generation...")
    const completedSections = await Promise.all(
      sections.map(async (section, index) => {
        console.log(`Writing section ${index + 1}/${sections.length}: ${section.name}`)
        try {
          if (!section.research) {
            console.log(`Section ${section.name} requires no research`)
            const content = await writer.invoke(
              `Write the ${section.name} section for the report. Keep it concise and relevant.`
            )
            return { ...section, content: content.content as string }
          }

          console.log(`Section ${section.name} using research results`)
          const relevantResults = searchResults[index % searchResults.length]
          const content = await writer.invoke(
            `Write the ${section.name} section using this research: ${JSON.stringify(relevantResults)}`
          )
          return { ...section, content: content.content as string }
        } catch (error) {
          console.error(`❌ Error writing section ${section.name}:`, error)
          throw error
        }
      })
    )
    console.log("✅ All sections completed")

    return {
      completedSections,
      status: "completed"
    }
  } catch (error) {
    console.error("❌ Error in buildSections:", error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    console.log("📥 Received POST request for report generation")
    const { topic, reportType, tone } = await req.json()
    const threadId = crypto.randomUUID()
    console.log("🆔 Generated threadId:", threadId)
    
    const initialState: ReportState = {
      topic,
      sections: [],
      completedSections: [],
      searchResults: [],
      status: "planning",
      threadId,
      metadata: { reportType, tone }
    }
    console.log("📝 Initial state created:", initialState)

    // Start async processing
    console.log("🔄 Starting WebSocket connection...")
    const ws = new WebSocket(`ws://localhost:3000/ws/${threadId}`)
    
    // Initial plan generation
    console.log("🎯 Starting initial plan generation...")
    const planUpdate = await generateReportPlan(initialState)
    const stateAfterPlan = { ...initialState, ...planUpdate }
    
    ws.send(JSON.stringify(stateAfterPlan))
    console.log("📤 Sent initial plan state over WebSocket")

    // Set up WebSocket message handler for feedback
    ws.onmessage = async (event) => {
      console.log("📥 Received WebSocket message")
      const feedback = JSON.parse(event.data)
      
      if (feedback.accept_report_plan === false) {
        console.log("🔄 Regenerating plan with feedback...")
        const newPlanUpdate = await generateReportPlan({
          ...stateAfterPlan,
          feedback: feedback.feedback_on_report_plan
        })
        ws.send(JSON.stringify({ ...stateAfterPlan, ...newPlanUpdate }))
      } else {
        console.log("✍️ Starting section building...")
        const sectionsUpdate = await buildSections(stateAfterPlan)
        ws.send(JSON.stringify({ ...stateAfterPlan, ...sectionsUpdate }))
        ws.close()
        console.log("🏁 Report generation completed")
      }
    }

    return NextResponse.json({ threadId })
  } catch (error) {
    console.error("❌ Fatal error in report generation:", error)
    return NextResponse.json(
      { error: "Failed to start report generation" },
      { status: 500 }
    )
  }
} 