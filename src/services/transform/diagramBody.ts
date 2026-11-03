/** YAML frontmatter: dosyanın başında `---` ... `---` bloğu (CRLF toleranslı). */
export const FRONTMATTER_RE = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/

/**
 * Mermaid kaynağından frontmatter, `%%{…}%%` direktifleri ve `%%` yorumlarını
 * çıkarır; geriye kalan ilk anlamlı satır diyagram türünü belirtir.
 */
export function diagramBody(code: string): string {
  return code
    .replace(FRONTMATTER_RE, '')
    .replace(/%%\{[\s\S]*?\}%%/g, '')
    .replace(/^\s*%%.*$/gm, '')
}
