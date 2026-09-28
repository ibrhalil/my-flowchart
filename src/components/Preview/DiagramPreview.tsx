import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  FileUp,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Frame,
  HardDriveDownload,
  HardDrive,
} from 'lucide-react'

import { useDiagramStore } from '../../store/diagramStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { AppTheme } from '../../types/project'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { renderMermaid, parseError } from '../../services/mermaidRenderer'
import { exportPng, exportSvg, exportMmd, exportJson, exportMarkdown } from '../../services/exporters/files'
import { importFromFile } from '../../services/importers/fileReader'
import { useTranslation } from '../../lib/i18n'
import { IconButton } from '../ui/Button'
import { MenuItem } from '../ui/MenuItem'
import { Tooltip } from '../Layout/Tooltip'
import { suppressTooltipFocusOpen } from '../Layout/tooltipFocus'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
// p-8 (32px) + p-6 (24px) her iki yanda -> toplam iç boşluk
const FIT_PAD = 56
// Bu oranın üzerindeki SVG boyut değişimi auto-fit'i yeniden tetikler
const FIT_REFIT_THRESHOLD = 0.15

/** Başarıyla render edilmiş diyagram + hangi kaynak/tema sürümünden geldiği */
interface RenderResult {
  svg: string
  code: string
  theme: AppTheme
}

function getSvgNaturalSize(svgString: string): { width: number; height: number } | null {
  try {
    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml')
    const el = doc.documentElement
    const wRaw = (el.getAttribute('width') ?? '').trim()
    const hRaw = (el.getAttribute('height') ?? '').trim()
    const w = parseFloat(wRaw)
    const h = parseFloat(hRaw)
    const isAbs = (v: number, raw: string) => isFinite(v) && v > 0 && !raw.endsWith('%')
    if (isAbs(w, wRaw) && isAbs(h, hRaw)) {
      return { width: w, height: h }
    }
    const vb = el.getAttribute('viewBox')
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number)
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3] }
      }
    }
    return null
  } catch {
    return null
  }
}

export function DiagramPreview() {
  const code = useDiagramStore((s) => s.code)
  const title = useDiagramStore((s) => s.title)
  const description = useDiagramStore((s) => s.description)
  const updatedAt = useDiagramStore((s) => s.updatedAt)
  const draftState = useDiagramStore((s) => s.draftState)
  const loadProject = useDiagramStore((s) => s.loadProject)
  const setToast = useDiagramStore((s) => s.setToast)

  const theme = useSettingsStore((s) => s.theme)
  const pngScale = useSettingsStore((s) => s.pngScale)
  const { t } = useTranslation()

  const debouncedCode = useDebouncedValue(code, 250)

  const [render, setRender] = useState<RenderResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const diagramRef = useRef<HTMLDivElement | null>(null)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null)
  const prevFitSizeRef = useRef<{ w: number; h: number } | null>(null)

  const project = useMemo(
    () => ({
      title,
      description,
      code,
      theme,
      pngScale,
      updatedAt,
    }),
    [title, description, code, theme, pngScale, updatedAt],
  )

  useEffect(() => {
    let cancelled = false
    setRendering(true)
    setError(null)
    renderMermaid(debouncedCode, theme)
      .then((out) => {
        if (cancelled) return
        setRender({ svg: out, code: debouncedCode, theme })
      })
      .catch((err) => {
        console.error('Mermaid diagram rendering failed:', err)
        if (cancelled) return
        setRender(null)
        setError(parseError(err))
      })
      .finally(() => {
        if (!cancelled) setRendering(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedCode, theme])

  // Görsel dışa aktarımı yalnızca SVG mevcut kaynak + tema sürümüne denkse güvenli.
  const imagesFresh = render !== null && render.code === code && render.theme === theme

  const clampZoom = useCallback((z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), [])
  const svgSize = useMemo(() => (render ? getSvgNaturalSize(render.svg) : null), [render])

  const computeFitZoom = useCallback((): number | null => {
    const scroller = scrollRef.current
    if (!scroller || !svgSize) return null
    const cw = scroller.clientWidth
    const ch = scroller.clientHeight
    if (cw <= 0 || ch <= 0) return null
    const z = Math.min(
      (cw - 2 * FIT_PAD) / svgSize.width,
      (ch - 2 * FIT_PAD) / svgSize.height,
    )
    if (!isFinite(z) || z <= 0) return null
    return clampZoom(z)
  }, [svgSize, clampZoom])

  const applyFit = useCallback(() => {
    const z = computeFitZoom()
    if (z == null) return
    setZoom(z)
    setPan({ x: 0, y: 0 })
  }, [computeFitZoom])

  const changeZoom = useCallback((nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom)
    setZoom(clampedZoom)
    requestAnimationFrame(() => {
      const scroller = scrollRef.current
      const diagram = diagramRef.current
      if (!scroller || !diagram) return
      const viewport = scroller.getBoundingClientRect()
      const bounds = diagram.getBoundingClientRect()
      scroller.scrollLeft += bounds.left + bounds.width / 2 - (viewport.left + viewport.width / 2)
      scroller.scrollTop += bounds.top + bounds.height / 2 - (viewport.top + viewport.height / 2)
    })
  }, [clampZoom])
  const zoomIn = useCallback(() => changeZoom(+(zoom + 0.15).toFixed(2)), [changeZoom, zoom])
  const zoomOut = useCallback(() => changeZoom(+(zoom - 0.15).toFixed(2)), [changeZoom, zoom])
  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // İlk render'da veya SVG boyutu belirgin şekilde değiştiğinde pencereye sığdır.
  // Küçük edit değişiklikleri (eşik altı) mevcut zoom'u korur.
  useEffect(() => {
    if (!svgSize) {
      prevFitSizeRef.current = null
      return
    }
    const prev = prevFitSizeRef.current
    const shouldFit =
      !prev ||
      Math.abs(prev.w - svgSize.width) / Math.max(prev.w, 1) > FIT_REFIT_THRESHOLD ||
      Math.abs(prev.h - svgSize.height) / Math.max(prev.h, 1) > FIT_REFIT_THRESHOLD
    prevFitSizeRef.current = { w: svgSize.width, h: svgSize.height }
    if (!shouldFit) return
    applyFit()
  }, [svgSize, applyFit])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    let previousWidth = scroller.getBoundingClientRect().width
    let previousHeight = scroller.getBoundingClientRect().height
    const observer = new ResizeObserver(() => {
      const { width, height } = scroller.getBoundingClientRect()
      if (width === previousWidth && height === previousHeight) return
      previousWidth = width
      previousHeight = height
      applyFit()
    })
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [applyFit])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
      // Tam ekran geçişinde viewport değişir; bir sonraki karede yeniden sığdır.
      requestAnimationFrame(() => applyFit())
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [applyFit])

  const toggleFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        // Tam ekrandan çıkışta tarayıcı odağı toggle butonuna geri verir;
        // bu programatik odak tooltip'i faresiz açmasın (yoksa ekranda takılır).
        suppressTooltipFocusOpen(600)
        void document.exitFullscreen().catch(() => {})
      } else if (containerRef.current?.requestFullscreen) {
        void containerRef.current.requestFullscreen().catch(() => {
          setToast(t('preview.fullscreenError'))
        })
      } else {
        setToast(t('preview.fullscreenError'))
      }
    } catch {
      setToast(t('preview.fullscreenError'))
    }
  }, [setToast, t])

  // Pan + pinch: Pointer Events (fare + dokunmatik + kalem).
  // `touch-action: none` sayesinde tarayıcının sayfa kaydırması/pinch'i engellenir
  // ve biz olayları kendimiz yönetiriz.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values())
      pinchRef.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startZoom: zoom,
      }
      setDragging(false)
    } else if (pointersRef.current.size === 1) {
      setDragging(true)
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointersRef.current.get(e.pointerId)
    if (!prev) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current && pinchRef.current.startDist > 0) {
      const [a, b] = Array.from(pointersRef.current.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const factor = dist / pinchRef.current.startDist
      changeZoom(+(pinchRef.current.startZoom * factor).toFixed(3))
      return
    }

    if (pointersRef.current.size === 1 && dragging) {
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
  }

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    // Pinch'ten tek parmağa dönüş: kalan parmakla sürüklemeye devam edilebilsin.
    setDragging(pointersRef.current.size === 1)
  }

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    // Mevcut zoom'a orantılı adım; yüksek zoomlarda daha doğal his.
    const factor = zoom * (e.deltaY < 0 ? 0.12 : -0.12)
    changeZoom(+(zoom + factor).toFixed(3))
  }

  const [exportingPng, setExportingPng] = useState(false)

  const handleExportPng = async () => {
    // Yalnızca güncel render'ı dışa aktar; bayat SVG'yi indirme.
    if (!render || !imagesFresh || exportingPng) return
    setExportingPng(true)
    try {
      await exportPng(render.svg, project, pngScale)
    } catch (err) {
      setToast(
        err instanceof Error
          ? `${t('preview.exportErrorPrefix')}${err.message}`
          : t('preview.pngError'),
      )
    } finally {
      setExportingPng(false)
    }
  }

  const handleExportSvg = () => {
    if (!render || !imagesFresh) return
    exportSvg(render.svg, project)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importing, setImporting] = useState(false)

  const handleImport = useCallback(
    async (file: File | null) => {
      if (!file) return
      setImporting(true)
      try {
        const { project: p, note } = await importFromFile(file)
        loadProject({
          code: p.code ?? '',
          title: p.title,
          description: p.description,
          theme: p.theme,
          pngScale: p.pngScale,
        })
        if (note) setToast(note)
      } catch (err) {
        setToast(
          err instanceof Error
            ? `${t('preview.errorPrefix')}${err.message}`
            : t('preview.importFail'),
        )
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [loadProject, setToast, t],
  )

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-bg-base"
    >
      <Toolbar
        zoom={zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetView={resetView}
        onFit={applyFit}
        onImport={() => fileInputRef.current?.click()}
        importing={importing}
        onPng={handleExportPng}
        onSvg={handleExportSvg}
        onMmd={() => exportMmd(project)}
        onJson={() => exportJson(project)}
        onMd={() => exportMarkdown(project)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        imagesReady={imagesFresh && !exportingPng}
        exportingPng={exportingPng}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".mmd,.md,.markdown,.json,.txt"
        onChange={(e) => void handleImport(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      <div
        ref={scrollRef}
        className="preview-scroll preview-canvas relative flex-1 cursor-grab overflow-auto"
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={onWheel}
      >
        <div
          className="flex min-h-full min-w-full items-center justify-center p-8"
        >
          {render ? (
            <div
              className="relative shrink-0"
              style={{
                width: svgSize ? `${(svgSize.width + 48) * zoom}px` : undefined,
                height: svgSize ? `${(svgSize.height + 48) * zoom}px` : undefined,
              }}
            >
              <div
                ref={diagramRef}
                className="preview-diagram absolute left-0 top-0 rounded-lg bg-bg-surface p-6 shadow-sm ring-1 ring-border"
                style={{
                  width: svgSize ? `${svgSize.width + 48}px` : undefined,
                  height: svgSize ? `${svgSize.height + 48}px` : undefined,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: dragging ? 'none' : 'transform 120ms ease-out',
                }}
                dangerouslySetInnerHTML={{ __html: render.svg }}
              />
            </div>
          ) : !error ? (
            <div className="text-sm text-text-subtle">{t('preview.previewNotReady')}</div>
          ) : null}
        </div>

        {/* Hata kartı ve durum bildirimleri zoom/pan dönüşümünden bağımsızdır. */}
        {error ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="pointer-events-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-danger/50 bg-danger-soft p-6 text-center text-text shadow-lg">
              <AlertTriangle size={28} className="text-danger" />
              <p className="text-sm font-semibold">{t('preview.renderErrorTitle')}</p>
              <pre className="max-h-60 w-full overflow-auto whitespace-pre-wrap text-left text-xs">{error}</pre>
            </div>
          </div>
        ) : null}

        {rendering && render && !error ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-3 py-1 text-xs font-medium text-text-muted shadow-sm ring-1 ring-border">
              <Loader2 size={12} className="animate-spin" />
              {t('preview.statusRendering')}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-surface px-3 py-1.5 text-xs text-text-subtle">
        <span className="flex items-center gap-1.5" role="status">
          {error ? (
            <>
              <AlertTriangle size={12} className="text-danger" /> {t('preview.statusError')}
            </>
          ) : rendering ? (
            <>
              <Loader2 size={12} className="animate-spin" /> {t('preview.statusRendering')}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-success" /> {t('preview.statusDone')}
            </>
          )}
        </span>
        <span className="flex items-center gap-1.5" role="status">
          {draftState === 'pending' ? (
            <>
              <Loader2 size={12} className="animate-spin" /> {t('preview.saveSaving')}
            </>
          ) : draftState === 'error' ? (
            <>
              <HardDriveDownload size={12} className="text-danger" /> {t('preview.saveError')}
            </>
          ) : (
            <>
              <HardDrive size={12} className="text-success" /> {t('preview.saveSaved')}
            </>
          )}
        </span>
        <span className="tabular-nums">{t('preview.zoomPercent', { pct: Math.round(zoom * 100) })}</span>
      </div>
    </div>
  )
}

interface ToolbarProps {
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  onFit: () => void
  onImport: () => void
  importing: boolean
  onPng: () => void
  onSvg: () => void
  onMmd: () => void
  onJson: () => void
  onMd: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  /** PNG/SVG dışa aktarımı güncel render'a denk mi? */
  imagesReady: boolean
  exportingPng: boolean
}

function Toolbar(props: ToolbarProps) {
  const [exportMenu, setExportMenu] = useState(false)
  const exportBtnRef = useRef<HTMLButtonElement | null>(null)
  const { t } = useTranslation()

  const closeAllMenus = () => setExportMenu(false)

  // Menü açıkken Escape ile kapat ve odağı düğmeye geri ver.
  useEffect(() => {
    if (!exportMenu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllMenus()
        exportBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exportMenu])

  const imageItemClass = props.imagesReady ? '' : 'opacity-50'

  return (
    <div className="@container flex items-center gap-1 border-b border-border bg-bg-surface px-3 py-2">
      {/* Tam ekran — en solda */}
      <IconButton
        label={props.isFullscreen ? t('preview.exitFullscreen') : t('preview.fullscreen')}
        onClick={props.onToggleFullscreen}
      >
        {props.isFullscreen ? <Minimize /> : <Maximize />}
      </IconButton>

      {/* Zoom grubu */}
      <IconButton label={t('preview.zoomOut')} onClick={props.zoomOut} disabled={props.zoom <= MIN_ZOOM}>
        <ZoomOut />
      </IconButton>
      <Tooltip label={t('preview.resetZoom')} side="bottom">
        <button
          type="button"
          onClick={props.resetView}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs tabular-nums text-text-muted transition hover:bg-bg-subtle hover:text-text"
        >
          %{Math.round(props.zoom * 100)}
        </button>
      </Tooltip>
      <IconButton label={t('preview.zoomIn')} onClick={props.zoomIn} disabled={props.zoom >= MAX_ZOOM}>
        <ZoomIn />
      </IconButton>
      <IconButton label={t('preview.fitToScreen')} onClick={props.onFit}>
        <Frame />
      </IconButton>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <div className="relative ml-auto flex items-center gap-1.5">
        {/* İçe aktar */}
        <IconButton
          label={t('preview.importTooltip')}
          side="bottom"
          onClick={props.onImport}
          disabled={props.importing}
        >
          {props.importing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <FileUp />
          )}
        </IconButton>

        {/* Dışa aktar — kaynak formatları her zaman erişilebilir; görsel
            formatlar yalnızca güncel render varken etkindir. */}
        <IconButton
          ref={exportBtnRef}
          label={t('preview.exportTooltip')}
          side="bottom"
          variant="primary"
          aria-haspopup="menu"
          aria-expanded={exportMenu}
          onClick={() => setExportMenu((v) => !v)}
        >
          <Download />
        </IconButton>
        {exportMenu ? (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closeAllMenus}
              aria-hidden
            />
            <div
              role="menu"
              aria-label={t('preview.export')}
              className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-bg-surface py-1 text-sm shadow-lg"
              style={{ top: '100%' }}
            >
              <MenuItem
                role="menuitem"
                disabled={!props.imagesReady}
                title={props.imagesReady ? undefined : t('preview.imagesStale')}
                className={imageItemClass}
                onClick={() => {
                  props.onPng()
                  setExportMenu(false)
                }}
              >
                {props.exportingPng ? t('preview.statusRendering') : t('preview.pngImage')}
              </MenuItem>
              <MenuItem
                role="menuitem"
                disabled={!props.imagesReady}
                title={props.imagesReady ? undefined : t('preview.imagesStale')}
                className={imageItemClass}
                onClick={() => {
                  props.onSvg()
                  setExportMenu(false)
                }}
              >
                {t('preview.svgVector')}
              </MenuItem>
              <div className="my-1 h-px bg-border" />
              <MenuItem role="menuitem" onClick={() => { props.onMd(); setExportMenu(false) }}>
                {t('preview.markdown')}
              </MenuItem>
              <MenuItem role="menuitem" onClick={() => { props.onMmd(); setExportMenu(false) }}>
                {t('preview.mermaidSource')}
              </MenuItem>
              <MenuItem role="menuitem" onClick={() => { props.onJson(); setExportMenu(false) }}>
                {t('preview.project')}
              </MenuItem>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
