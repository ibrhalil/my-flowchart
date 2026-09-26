import type { ProjectFile } from '../../types/project'

const DRAFT_KEY = 'mermaid-studio:draft:v1'

export function loadDraft(): Partial<ProjectFile> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && typeof parsed.code === 'string') {
      return parsed as Partial<ProjectFile>
    }
    return null
  } catch {
    return null
  }
}

/** Taslağı yazar. Depolama yazılamazsa false döner (sessizce yutulmaz). */
export function saveDraft(project: ProjectFile): boolean {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title: project.title,
        description: project.description,
        code: project.code,
        theme: project.theme,
        pngScale: project.pngScale,
        updatedAt: project.updatedAt,
      }),
    )
    return true
  } catch {
    // Kota dolu / depolama kapalı olabilir — çağıran taraf hata durumunu bilir.
    return false
  }
}
