export interface Section {
  name: string
  description: string
  research: boolean
  content: string
}

export interface ReportState {
  topic: string
  feedback?: string
  sections: Section[]
  completedSections: Section[]
  searchResults: any[]
  status?: ReportStatus
  threadId?: string
  metadata?: {
    reportType: string
    tone: string
  }
}

export interface SectionState {
  section: Section
  searchQueries: string[]
  sourceContent: string
}

export type ReportStatus = 
  | "idle" 
  | "planning" 
  | "awaiting_feedback" 
  | "writing" 
  | "completed" 
  | "error"

export interface ReportProgress {
  status: ReportStatus
  threadId?: string
  sections: Section[]
  completedSections: Section[]
  currentSection?: Section
  error?: string
} 