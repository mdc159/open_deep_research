export interface AppConfig {
  reportStructure: string
  numberOfQueries: number
  tavilyTopic: "general" | "news"
  tavilyDays?: number
  plannerModel: "deepseek-reasoner" | "o3-mini" | "claude-3-sonnet-20240620"
  writerModel: "claude-3-sonnet-20240620" | "o3-mini"
  deepseekApiKey?: string
  anthropicApiKey?: string
  reasoningEffort: "low" | "medium" | "high"
}

export const DEFAULT_CONFIG: AppConfig = {
  reportStructure: `The report structure should focus on breaking-down the user-provided topic:
1. Introduction (no research needed)
2. Main Body Sections with sub-topics
3. Conclusion with structural element`,
  numberOfQueries: 2,
  tavilyTopic: "general",
  plannerModel: "deepseek-reasoner",
  writerModel: "claude-3-sonnet-20240620",
  reasoningEffort: "medium"
}

export function getConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    tavilyDays: overrides.tavilyTopic === "news" ? 7 : undefined
  }
} 