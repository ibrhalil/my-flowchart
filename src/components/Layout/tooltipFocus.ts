/**
 * Programatik odak geri dönüşü (Modal kapanışı, tam ekran çıkışı) tooltip'i faresiz açıp ekranda
 * takılı bırakır; `ms` boyunca focus kaynaklı açılış yok sayılır. Klavye (Tab) odağı etkilenmez.
 */
let suppressFocusOpenUntil = 0

export function suppressTooltipFocusOpen(ms = 150): void {
  suppressFocusOpenUntil = Math.max(suppressFocusOpenUntil, performance.now() + ms)
}

export function isTooltipFocusOpenSuppressed(): boolean {
  return performance.now() < suppressFocusOpenUntil
}
