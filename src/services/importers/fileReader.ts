import type { ProjectFile, AppTheme } from '../../types/project'
import { rt } from '../../lib/i18nRuntime'

export interface ImportOutcome {
  project: Partial<ProjectFile>
  /** Ayrıştırma sırasında kullanıcıya gösterilecek mesaj */
  note?: string
}

const THEME_VALUES: AppTheme[] = ['light', 'dark']

function safeTheme(v: unknown): AppTheme | undefined {
  return typeof v === 'string' && (THEME_VALUES as string[]).includes(v) ? (v as AppTheme) : undefined
}

export async function readTextFile(file: File): Promise<string> {
  return await file.text()
}

export function importFromMmd(code: string, fallbackTitle: string): ImportOutcome {
  const project: Partial<ProjectFile> = {
    code,
    title: fallbackTitle,
  }
  return { project, note: rt('preview.importedSource') }
}

export function importFromJson(text: string): ImportOutcome {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(rt('preview.invalidJson'))
  }

  type Schema = { project?: Partial<ProjectFile> }
  const candidate =
    parsed && typeof parsed === 'object' && 'project' in (parsed as Schema)
      ? ((parsed as Schema).project as Partial<ProjectFile>)
      : (parsed as Partial<ProjectFile>)

  if (!candidate || typeof candidate !== 'object' || typeof candidate.code !== 'string') {
    throw new Error(rt('preview.jsonNoCode'))
  }

  const project: Partial<ProjectFile> = {
    code: candidate.code,
    title: candidate.title,
    description: candidate.description,
    theme: safeTheme(candidate.theme),
    pngScale:
      typeof candidate.pngScale === 'number' && candidate.pngScale > 0 && candidate.pngScale <= 4
        ? candidate.pngScale
        : undefined,
  }

  return { project, note: rt('preview.importedProject') }
}

export async function importFromFile(file: File): Promise<ImportOutcome> {
  const text = await readTextFile(file)
  const name = file.name.replace(/\.[^.]+$/, '')
  const lower = file.name.toLowerCase()

  if (lower.endsWith('.mmd')) {
    return importFromMmd(text, name)
  }

  if (lower.endsWith('.json')) {
    return importFromJson(text)
  }

  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    const { parseMarkdown } = await import('./markdownParser')
    const parsed = parseMarkdown(text)
    if (parsed.mermaidBlocks.length === 0) {
      throw new Error(rt('preview.mermaidBlockNotFound'))
    }
    return {
      project: {
        code: parsed.mermaidBlocks[0],
        title: parsed.title ?? name,
        description: parsed.description,
      },
      note:
        parsed.mermaidBlocks.length > 1
          ? rt('preview.importedMarkdownMany', { count: parsed.mermaidBlocks.length })
          : rt('preview.importedMarkdown'),
    }
  }

  // Bilinmeyen uzantı: metin olarak deneyelim
  return importFromMmd(text, name)
}
