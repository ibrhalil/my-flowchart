export type DiagramType =
  | 'flowchart'
  | 'sequenceDiagram'
  | 'classDiagram'
  | 'stateDiagram'
  | 'erDiagram'
  | 'gantt'
  | 'pie'
  | 'user-journey'
  | 'gitGraph'
  | 'mindmap'
  | 'timeline'
  | 'quadrant'
  | 'requirement'
  | 'architecture'
  | 'xychart'
  | 'block'
  | 'kanban'
  | 'other'

export type AppTheme = 'light' | 'dark'
export type Locale = 'en' | 'tr'

export interface ProjectFile {
  /** Markdown başlığı / doküman başlığı */
  title: string
  /** Kısa açıklama; `.md` çıktısının üstünde gösterilir */
  description?: string
  /** Mermaid kaynak kodu */
  code: string
  /** Tema */
  theme: AppTheme
  /** PNG export için ölçek (1, 2, 3) */
  pngScale: number
  /** Oluşturulma / güncellenme zaman damgası (ms) */
  updatedAt: number
}

export interface TemplateEntry {
  id: string
  type: DiagramType
  title: string
  description: string
  code: string
}

export interface HistoryEntry {
  id: string
  title: string
  code: string
  savedAt: number
}

export const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  flowchart: 'Flowchart',
  sequenceDiagram: 'Sequence',
  classDiagram: 'Class',
  stateDiagram: 'State',
  erDiagram: 'Entity Relationship',
  gantt: 'Gantt',
  pie: 'Pie',
  'user-journey': 'User Journey',
  gitGraph: 'Git Graph',
  mindmap: 'Mindmap',
  timeline: 'Timeline',
  quadrant: 'Quadrant',
  requirement: 'Requirement',
  architecture: 'Architecture',
  xychart: 'XY Chart',
  block: 'Block',
  kanban: 'Kanban',
  other: 'Diğer',
}
