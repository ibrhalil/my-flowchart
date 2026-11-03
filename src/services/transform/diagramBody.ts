export const FRONTMATTER_RE = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/

/** Frontmatter, direktif ve yorumlar çıkarılır; ilk anlamlı satır diyagram türünü verir. */
export function diagramBody(code: string): string {
  return code
    .replace(FRONTMATTER_RE, '')
    .replace(/%%\{[\s\S]*?\}%%/g, '')
    .replace(/^\s*%%.*$/gm, '')
}
