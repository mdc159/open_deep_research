import { NextResponse } from "next/server"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { getConfig } from "@/lib/config"
import { ReportState, Section } from "@/lib/report-state"
import { StateGraph, Annotation, END } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { updateReportState } from "../report/[threadId]/route"

// Define the graph state annotation
const ReportStateAnnotation = Annotation.Root({
  messages: Annotation<AIMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  sections: Annotation<Section[]>({
    reducer: (_, y) => y,
  }),
  searchResults: Annotation<any[]>({
    reducer: (_, y) => y,
  }),
  status: Annotation<string>({
    reducer: (_, y) => y,
  })
})

// Type guard for models with bindTools
interface ModelWithTools extends BaseChatModel {
  bindTools: (tools: any[]) => BaseChatModel;
}

function isModelWithTools(model: any): model is ModelWithTools {
  return model && typeof model.bindTools === 'function';
}

// Zod schemas for validation
const TavilyConfigSchema = z.object({
  maxResults: z.number().min(1).max(10).default(5),
  searchDepth: z.enum(["basic", "deep", "advanced"]).default("deep"),
  includeRawContent: z.boolean().default(false),
  includeAnswer: z.boolean().default(true),
  includeDomains: z.array(z.string()).optional(),
  excludeDomains: z.array(z.string()).optional()
})

const TavilyQuerySchema = z.object({
  query: z.string().min(1).max(300).transform(q => 
    q.replace(/['"]/g, '')
     .replace(/\s+/g, ' ')
     .trim()
  )
})

// Improved Tavily tool initialization
async function createTavilySearchTool(config: any) {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey?.startsWith('tvly-')) {
    throw new Error('Invalid Tavily API key format. Key must start with "tvly-"')
  }

  console.log("🌐 Initializing Tavily search tool with config:", {
    apiKey: "present",
    maxResults: config.maxResults || 5,
    searchDepth: "deep",
    includeAnswer: true,
    includeRawContent: true,
    topic: config.tavilyTopic || "general"
  })

  return new TavilySearchResults({
    apiKey,
    maxResults: config.maxResults || 5,
    searchDepth: "deep",
    includeAnswer: true,
    includeRawContent: true,
    includeImages: false,
    topic: config.tavilyTopic || "general",
    ...(config.tavilyTopic === "news" && { days: config.tavilyDays || 7 }),
    includeDomains: config.includeDomains || ["*.gov", "*.edu"],
    excludeDomains: config.excludeDomains || ["*.blogspot.com"]
  })
}

// Simplified search execution with proper parameter naming
async function executeTavilySearch(searchTool: any, query: string) {
  let validatedQuery: string = query;  // Initialize with original query
  try {
    // Clean and validate query
    validatedQuery = TavilyQuerySchema.parse({ query }).query
    
    if (validatedQuery.length > 300) {
      console.warn("⚠️ Query too long, truncating:", validatedQuery)
      return []
    }

    // Log the full request configuration
    const requestConfig = {
      query: validatedQuery,
      includeAnswer: true,
      includeRawContent: true,
      searchDepth: "deep"
    }
    console.log("🔍 Tavily Search Request:", {
      endpoint: "https://api.tavily.com/search",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: requestConfig
    })

    // Execute the search
    console.log("🔍 Executing search for query:", validatedQuery)
    try {
      const rawResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`
        },
        body: JSON.stringify(requestConfig)
      });

      // Log the raw response before parsing
      console.log("🔍 Tavily Raw Response:", {
        status: rawResponse.status,
        statusText: rawResponse.statusText,
        headers: Object.fromEntries(rawResponse.headers.entries())
      });

      const responseText = await rawResponse.text();
      console.log("🔍 Tavily Response Body:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse Tavily response:", parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!rawResponse.ok) {
        throw new Error(`Tavily API Error (${rawResponse.status}): ${JSON.stringify(result)}`);
      }
    
      if (!result || !Array.isArray(result?.results)) {
        console.warn("⚠️ Invalid search result format:", result)
        return []
      }

      // Deduplicate and format results
      const uniqueResults = result.results.reduce((acc: any[], curr: any) => {
        if (!acc.some(item => item.url === curr.url)) {
          acc.push({
            ...curr,
            content: curr.content?.slice(0, 5000)
          })
        }
        return acc
      }, [])

      return uniqueResults
    } catch (fetchError: unknown) {
      console.error("❌ Tavily API Error:", {
        error: fetchError instanceof Error ? {
          message: fetchError.message,
          cause: fetchError.cause,
          stack: fetchError.stack
        } : String(fetchError)
      });
      throw fetchError;
    }
  } catch (error: any) {
    console.error("❌ Search execution error:", {
      query,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      },
      requestDetails: {
        query: validatedQuery,
        endpoint: "https://api.tavily.com/search"
      }
    })
    return []
  }
}

async function generateReportPlan(state: ReportState): Promise<Partial<ReportState>> {
  console.log("🚀 Starting report plan generation for topic:", state.topic)
  const config = getConfig()
  console.log("📝 Using configuration:", {
    plannerModel: config.plannerModel,
    numberOfQueries: config.numberOfQueries
  })
  
  try {
    // Initialize Tavily search tool with improved configuration
    const searchTool = await createTavilySearchTool(config)

    // Create tool node
    const tools = [searchTool]
    console.log("🛠️ Created tool node with tools:", tools.map(t => t.constructor.name))
    const toolNode = new ToolNode(tools)

    // Configure model based on selection
    console.log("🤖 Initializing model for planning")
    let llm: BaseChatModel & { bindTools: Function };
    
    if (config.plannerModel.startsWith("o")) {
      const modelMap: Record<string, string> = {
        "o1": "o1-2024-12-17",
        "o1-mini": "o1-mini-2024-09-12",
        "o3-mini": "o3-mini-2025-01-31"
      }
      llm = new ChatOpenAI({
        modelName: modelMap[config.plannerModel] || "o3-mini-2025-01-31",
        apiKey: process.env.OPENAI_API_KEY
      }) as BaseChatModel & { bindTools: Function }
    } else {
      // Fallback to Claude
      llm = new ChatAnthropic({
        modelName: "claude-3-sonnet-20240620",
        apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      }) as BaseChatModel & { bindTools: Function }
    }

    // Bind tools to model
    const boundModel = llm.bindTools(tools)

    // Define graph nodes
    function shouldContinue(state: typeof ReportStateAnnotation.State) {
      const messages = state.messages
      const lastMessage = messages[messages.length - 1] as AIMessage
      
      if (lastMessage.tool_calls?.length) {
        return "tools"
      }
      return "__end__"
    }

    async function callModel(state: typeof ReportStateAnnotation.State) {
      const messages = state.messages
      const response = await boundModel.invoke(messages)
      return { messages: [response] }
    }

    // Create and compile graph
    const workflow = new StateGraph(ReportStateAnnotation)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue, {
        tools: "tools",
        __end__: END
      })
      .addEdge("tools", "agent")

    const app = workflow.compile()

    // Generate initial structure
    console.log("📋 Generating report structure...")
    const planPrompt = new HumanMessage({
      content: `
        ${config.reportStructure}
        Topic: ${state.topic}
        ${state.feedback ? `Previous feedback: ${state.feedback}` : ""}
        Generate a detailed report structure with sections.
      `
    })
    
    const planState = await app.invoke({ 
      messages: [planPrompt],
      sections: [],
      searchResults: [],
      status: "planning"
    })

    const plan = planState.messages[planState.messages.length - 1]
    console.log("✅ Generated plan:", plan.content)
    
    // Generate search queries
    console.log("🔍 Generating search queries...")
    const searchPrompt = new HumanMessage({
      content: `Based on this report plan, generate ${config.numberOfQueries} search queries for research:
        ${plan.content}`
    })
    
    const queryState = await app.invoke({
      messages: [searchPrompt],
      sections: [],
      searchResults: [],
      status: "searching"
    })

    const queries = queryState.messages[queryState.messages.length - 1]
    console.log("✅ Generated queries:", queries.content)
    
    // Process search queries with improved validation
    console.log("🔎 Executing searches...")
    const searchQueries = (queries.content as string)
      .split("\n")
      .filter((q: string) => q.trim())
      .map((q: string) => {
        // Extract core query
        const query = q
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/["']/g, '') // Remove quotes
          .replace(/^[^:]+:\s*/, '') // Remove prefixes like "Query:"
          .trim()
        return query
      })
      .filter(q => 
        q.length > 0 && 
        q.length <= 300 && // Enforce length limit
        !q.toLowerCase().includes("here are") && 
        !q.toLowerCase().includes("based on")
      )

    try {
      // Execute searches in parallel
      console.log("🌐 Running Tavily searches...")
      const searchResults = await Promise.all(
        searchQueries.map(async (query, index) => {
          console.log(`🔍 Search ${index + 1}/${searchQueries.length}:`, query)
          return executeTavilySearch(searchTool, query)
        })
      )

      // Filter out empty results
      const validResults = searchResults.filter(result => result && result.length > 0)
      console.log("✅ Search completed:", validResults.length, "valid results")

      // Process results into sections
      console.log("📑 Processing sections...")
      const sections: Section[] = (plan.content as string)
        .split("\n")
        .filter((line: string) => line.match(/^[IVX]+\.|^[A-Z]\./))
        .map((line: string) => ({
          name: line.replace(/^[IVX]+\.\s*|^[A-Z]\.\s*/, "").split("(")[0].trim(),
          description: line,
          research: !line.includes("(no research needed)"),
          content: ""
        }))
      console.log("✅ Processed sections:", sections.length, "sections")

      return { 
        sections,
        searchResults: validResults,
        status: "awaiting_feedback"
      }
    } catch (error) {
      console.error("❌ Error in search execution:", error)
      throw error
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
    } else if (config.writerModel.startsWith("claude")) {
      console.log("🤖 Initializing Claude model for writing")
      if (!config.anthropicApiKey) {
        throw new Error('Anthropic API key is required');
      }
      writer = new ChatAnthropic({
        modelName: config.writerModel,
        apiKey: config.anthropicApiKey,
        temperature: 0
      });
    } else {
      throw new Error('Unsupported writer model');
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
    updateReportState(threadId, initialState)

    // Start async report generation
    generateReportPlan(initialState).then(planUpdate => {
      const stateAfterPlan = { ...initialState, ...planUpdate }
      updateReportState(threadId, stateAfterPlan)
      
      return buildSections(stateAfterPlan)
    }).then(sectionsUpdate => {
      const finalState = { ...initialState, ...sectionsUpdate, status: "completed" }
      updateReportState(threadId, finalState)
    }).catch(error => {
      console.error("❌ Error in report generation:", error)
      updateReportState(threadId, { 
        ...initialState, 
        status: "error",
        error: error?.message || "Unknown error occurred"
      })
    })

    // Return immediately with threadId for client to start polling
    return NextResponse.json({ threadId })
  } catch (error: any) {
    console.error("❌ Fatal error in report generation:", error)
    return NextResponse.json(
      { 
        error: "Failed to start report generation", 
        details: error?.message || "Unknown error occurred" 
      },
      { status: 500 }
    )
  }
} 