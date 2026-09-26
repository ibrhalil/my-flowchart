import type { DiagramType } from '../../types/project'

/**
 * Diyagram türü için hafif, tutarlı SVG glif.
 * Gerçek Mermaid render'ı yerine statik çizimler kullanır:
 * galeri açılışında 24 render maliyeti ödenmez, temayla uyumlu kalır.
 */

const S = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

function FlowchartGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={16} y={3} width={16} height={8} rx={4} {...S} />
      <path d="M24 11v5" {...S} />
      <path d="M24 16 17 25h14z" {...S} />
      <path d="M17 29 9 37v6M31 29l8 8v6" {...S} />
      <path d="M16 37h16" {...S} strokeDasharray="none" />
    </svg>
  )
}

function SequenceGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M10 5v38M24 5v38M38 5v38" {...S} strokeDasharray="3 3" />
      <rect x={6} y={2} width={8} height={6} rx={2} {...S} />
      <rect x={20} y={2} width={8} height={6} rx={2} {...S} />
      <rect x={34} y={2} width={8} height={6} rx={2} {...S} />
      <path d="M10 14h14M24 22h14M38 30H24M24 38H10" {...S} />
      <path d="M36 27l4 3-4 3M12 35l-4 3 4 3" {...S} />
    </svg>
  )
}

function ClassGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={17} y={2} width={14} height={10} rx={1.5} {...S} />
      <rect x={3} y={33} width={14} height={10} rx={1.5} {...S} />
      <rect x={31} y={33} width={14} height={10} rx={1.5} {...S} />
      <path d="M24 12v8M10 33v-6h28v6" {...S} />
      <path d="M24 20 12 27M24 20l12 7" {...S} />
    </svg>
  )
}

function StateGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <circle cx={10} cy={7} r={4} {...S} />
      <rect x={18} y={3} width={16} height={8} rx={4} {...S} />
      <rect x={18} y={20} width={16} height={8} rx={4} {...S} />
      <rect x={14} y={37} width={20} height={8} rx={4} {...S} />
      <circle cx={42} cy={41} r={3.5} {...S} />
      <path d="M14 7h4v12h0M34 11v9h0M26 28v9h8" {...S} />
    </svg>
  )
}

function ErGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={3} y={8} width={16} height={13} rx={1.5} {...S} />
      <path d="M3 13h16" {...S} />
      <rect x={29} y={27} width={16} height={13} rx={1.5} {...S} />
      <path d="M29 32h16" {...S} />
      <path d="M19 15c8 0 2 12 10 12" {...S} />
      <path d="M37 27l3 1-1 3" {...S} strokeDasharray="none" />
    </svg>
  )
}

function GanttGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M6 5v37h37" {...S} />
      <path d="M11 10h14M11 17h26M11 24h20M11 31h30" {...S} />
      <circle cx={41} cy={31} r={2.4} {...S} />
    </svg>
  )
}

function PieGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <circle cx={24} cy={24} r={18} {...S} />
      <path d="M24 24V6M24 24l15 10" {...S} />
    </svg>
  )
}

function JourneyGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M6 40C14 38 16 30 24 24s18-8 18-16" {...S} />
      <circle cx={6} cy={40} r={3} {...S} />
      <circle cx={15} cy={34} r={3} {...S} />
      <circle cx={24} cy={24} r={3} {...S} />
      <circle cx={33} cy={13} r={3} {...S} />
      <circle cx={42} cy={8} r={3} {...S} />
    </svg>
  )
}

function GitGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M8 40h12c6 0 6-16 12-20" {...S} />
      <path d="M32 20h8" {...S} />
      <circle cx={8} cy={40} r={3} {...S} />
      <circle cx={20} cy={40} r={3} {...S} />
      <circle cx={32} cy={20} r={3} {...S} />
      <circle cx={40} cy={20} r={3} {...S} />
      <circle cx={32} cy={8} r={3} {...S} />
      <path d="M32 11v6" {...S} />
    </svg>
  )
}

function MindmapGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <circle cx={24} cy={24} r={5} {...S} />
      <circle cx={8} cy={10} r={3.4} {...S} />
      <circle cx={40} cy={10} r={3.4} {...S} />
      <circle cx={8} cy={38} r={3.4} {...S} />
      <circle cx={40} cy={38} r={3.4} {...S} />
      <path d="M21 21 11 13M27 21l10-8M21 27l-10 8M27 27l10 8" {...S} />
    </svg>
  )
}

function TimelineGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M5 24h38" {...S} />
      <circle cx={11} cy={24} r={3.2} {...S} />
      <circle cx={24} cy={24} r={3.2} {...S} />
      <circle cx={37} cy={24} r={3.2} {...S} />
      <path d="M11 21V10M24 27v11M37 21V10" {...S} />
      <rect x={7} y={4} width={8} height={5} rx={1.5} {...S} />
      <rect x={33} y={4} width={8} height={5} rx={1.5} {...S} />
      <rect x={20} y={38} width={8} height={5} rx={1.5} {...S} />
    </svg>
  )
}

function QuadrantGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={5} y={5} width={38} height={38} rx={2} {...S} />
      <path d="M24 5v38M5 24h38" {...S} />
      <circle cx={33} cy={14} r={2.6} {...S} />
      <circle cx={14} cy={14} r={2.6} {...S} />
      <circle cx={14} cy={34} r={2.6} {...S} />
    </svg>
  )
}

function RequirementGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={4} y={6} width={18} height={12} rx={1.5} {...S} />
      <rect x={26} y={30} width={18} height={12} rx={1.5} {...S} />
      <path d="M4 12h18M26 36h18" {...S} />
      <path d="M22 12c10 0 8 18 4 18" {...S} />
    </svg>
  )
}

function ArchitectureGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={3} y={8} width={18} height={32} rx={2} {...S} strokeDasharray="4 3" />
      <rect x={27} y={8} width={18} height={32} rx={2} {...S} strokeDasharray="4 3" />
      <rect x={6} y={12} width={12} height={9} rx={1.5} {...S} strokeDasharray="none" />
      <rect x={30} y={12} width={12} height={9} rx={1.5} {...S} strokeDasharray="none" />
      <rect x={30} y={27} width={12} height={9} rx={1.5} {...S} strokeDasharray="none" />
      <path d="M18 16h12" {...S} />
    </svg>
  )
}

function XychartGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M7 5v37h36" {...S} />
      <path d="M12 38V28M19 38V22M26 38V25M33 38V12M40 38V18" {...S} />
    </svg>
  )
}

function BlockGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <rect x={4} y={4} width={22} height={18} rx={1.5} {...S} />
      <rect x={22} y={26} width={22} height={18} rx={1.5} {...S} />
      <rect x={10} y={28} width={8} height={14} rx={7} {...S} />
      <path d="M15 22v6M26 13h8v13" {...S} />
    </svg>
  )
}

function KanbanGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <path d="M4 8v34M18 8v34M32 8v34" {...S} />
      <rect x={6} y={12} width={10} height={8} rx={1.5} {...S} />
      <rect x={20} y={12} width={10} height={8} rx={1.5} {...S} />
      <rect x={20} y={26} width={10} height={8} rx={1.5} {...S} />
      <rect x={34} y={26} width={10} height={8} rx={1.5} {...S} />
    </svg>
  )
}

function GenericGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full text-primary" aria-hidden>
      <circle cx={12} cy={12} r={5} {...S} />
      <circle cx={36} cy={20} r={5} {...S} />
      <circle cx={16} cy={36} r={5} {...S} />
      <path d="M16 15l15 3M32 25l-13 8" {...S} />
    </svg>
  )
}

const GLYPHS: Record<DiagramType, () => React.ReactNode> = {
  flowchart: FlowchartGlyph,
  sequenceDiagram: SequenceGlyph,
  classDiagram: ClassGlyph,
  stateDiagram: StateGlyph,
  erDiagram: ErGlyph,
  gantt: GanttGlyph,
  pie: PieGlyph,
  'user-journey': JourneyGlyph,
  gitGraph: GitGlyph,
  mindmap: MindmapGlyph,
  timeline: TimelineGlyph,
  quadrant: QuadrantGlyph,
  requirement: RequirementGlyph,
  architecture: ArchitectureGlyph,
  xychart: XychartGlyph,
  block: BlockGlyph,
  kanban: KanbanGlyph,
  other: GenericGlyph,
}

export function TypeGlyph({ type }: { type: DiagramType }) {
  const Glyph = GLYPHS[type] ?? GenericGlyph
  return <>{Glyph()}</>
}
