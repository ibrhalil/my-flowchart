/**
 * Programatik odak geri dönüşünde (ör. Modal kapanışı odağı tetikleyici
 * butona geri verir, tam ekrandan çıkış odağı toggle butonuna döndürür)
 * tooltip'in faresiz açılıp ekranda takılmasını önlemek için kısa süreli
 * bastırma bayrağı. `ms` süresi boyunca focus kaynaklı tooltip açılışı
 * yok sayılır; süre dolunca bayrak kendiliğinden düşer, klavye (Tab) ile
 * gelen odak tooltip'i her zamanki gibi açmaya devam eder.
 */
let suppressFocusOpenUntil = 0

export function suppressTooltipFocusOpen(ms = 150): void {
  suppressFocusOpenUntil = Math.max(suppressFocusOpenUntil, performance.now() + ms)
}

export function isTooltipFocusOpenSuppressed(): boolean {
  return performance.now() < suppressFocusOpenUntil
}
