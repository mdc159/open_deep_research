export type PlannerModel = 
  | "o1"      // OpenAI O1
  | "o1-mini" // OpenAI O1 Mini
  | "o3-mini" // OpenAI O3 Mini
  | "deepseek-reasoner"

export type WriterModel = 
  | "o1" 
  | "o1-mini" 
  | "o3-mini"
  | "deepseek-chat" 
  | "claude-3-sonnet-20240620"
  | "claude-3-opus-20240229"
  | "claude-3-haiku-20240307"

export interface AppConfig {
  reportStructure: string
  numberOfQueries: number
  tavilyTopic: "general" | "news"
  tavilyDays?: number
  plannerModel: PlannerModel
  writerModel: WriterModel
  reasoningEffort: "low" | "medium" | "high"
  deepseekApiKey?: string
  anthropicApiKey?: string
}

export const DEFAULT_CONFIG: AppConfig = {
  reportStructure: `The report structure should focus on breaking-down the user-provided topic:
1. Introduction (no research needed)
2. Main Body Sections with sub-topics
3. Conclusion with structural element`,
  numberOfQueries: 2,
  tavilyTopic: "general",
  plannerModel: "o3-mini",
  writerModel: "claude-3-sonnet-20240620",
  reasoningEffort: "medium"
}

export function getConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    tavilyDays: overrides.tavilyTopic === "news" ? 7 : undefined,
    // Load API keys from environment if not provided in overrides
    anthropicApiKey: overrides.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
    deepseekApiKey: overrides.deepseekApiKey || process.env.DEEPSEEK_API_KEY
  }
} 