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
} from 'lucide-react'

import { useDiagramStore } from '../../store/diagramStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { renderMermaid, parseError, configureMermaid } from '../../services/mermaidRenderer'
import { exportPng, exportSvg, exportMmd, exportJson, exportMarkdown } from '../../services/exporters/files'
import { importFromFile } from '../../services/importers/fileReader'
import { useTranslation } from '../../lib/i18n'
import { Button, IconButton } from '../ui/Button'
import { MenuItem } from '../ui/MenuItem'
import { Tooltip } from '../Layout/Tooltip'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
// p-8 (32px) + p-6 (24px) her iki yanda -> toplam iç boşluk
const FIT_PAD = 56
// Bu oranın üzerindeki SVG boyut değişimi auto-fit'i yeniden tetikler
const FIT_REFIT_THRESHOLD = 0.15

function getSvgNaturalSize(svgString: string): { width: number; height: number } | null {
  try {
    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml')
    const el = doc.documentElement
    const w = parseFloat(el.getAttribute('width') ?? '')
    const h = parseFloat(el.getAttribute('height') ?? '')
    if (isFinite(w) && isFinite(h) && w > 0 && h > 0) {
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
  const loadProject = useDiagramStore((s) => s.loadProject)
  const setToast = useDiagramStore((s) => s.setToast)

  const theme = useSettingsStore((s) => s.theme)
  const pngScale = useSettingsStore((s) => s.pngScale)
  const { t } = useTranslation()

  const debouncedCode = useDebouncedValue(code, 250)

  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastPos = useRef({ x: 0, y: 0 })
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
    configureMermaid(theme)
    renderMermaid(debouncedCode, theme)
      .then((out) => {
        if (cancelled) return
        setSvg(out)
      })
      .catch((err) => {
        if (cancelled) return
        setSvg('')
        setError(parseError(err))
      })
      .finally(() => {
        if (!cancelled) setRendering(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedCode, theme])

  const clampZoom = useCallback((z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), [])
  const svgSize = useMemo(() => getSvgNaturalSize(svg), [svg])

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

  const zoomIn = useCallback(
    () => setZoom((z) => clampZoom(+(z + 0.15).toFixed(2))),
    [clampZoom],
  )
  const zoomOut = useCallback(
    () => setZoom((z) => clampZoom(+(z - 0.15).toFixed(2))),
    [clampZoom],
  )
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
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
      // Tam ekran geçişinde viewport değişir; bir sonraki karede yeniden sığdır.
      requestAnimationFrame(() => applyFit())
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [applyFit])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen()
    }
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
    const up = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [dragging])

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    // Mevcut zoom'a orantılı adım; yüksek zoomlarda daha doğal his.
    setZoom((z) => {
      const factor = z * (e.deltaY < 0 ? 0.12 : -0.12)
      return clampZoom(+(z + factor).toFixed(3))
    })
  }

  const handleExportPng = async () => {
    if (!svg) return
    try {
      await exportPng(svg, project, pngScale)
    } catch (err) {
      setToast(
        err instanceof Error
          ? `${t('preview.errorPrefix')}${err.message}`
          : t('preview.pngError'),
      )
    }
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
        onSvg={() => svg && exportSvg(svg, project)}
        onMmd={() => exportMmd(project)}
        onJson={() => exportJson(project)}
        onMd={() => exportMarkdown(project)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        hasError={Boolean(error)}
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
        className="preview-scroll relative flex-1 cursor-grab overflow-auto"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
      >
        <div
          className="flex min-h-full min-w-full items-center justify-center p-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 120ms ease-out',
          }}
        >
          {error ? (
            <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-danger/50 bg-danger-soft p-6 text-center text-text">
              <AlertTriangle size={28} className="text-danger" />
              <p className="text-sm font-semibold">{t('preview.renderErrorTitle')}</p>
              <pre className="max-h-60 w-full overflow-auto whitespace-pre-wrap text-left text-xs">{error}</pre>
            </div>
          ) : svg ? (
            <div
              className="rounded-lg bg-bg-surface p-6 shadow-sm ring-1 ring-border"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="text-sm text-text-subtle">{t('preview.previewNotReady')}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-bg-surface px-3 py-1.5 text-xs text-text-subtle">
        <span className="flex items-center gap-1.5">
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
  hasError: boolean
}

function Toolbar(props: ToolbarProps) {
  const [exportMenu, setExportMenu] = useState(false)
  const { t } = useTranslation()

  const closeAllMenus = () => {
    setExportMenu(false)
  }

  return (
    <div className="@container flex items-center gap-1 border-b border-border bg-bg-surface px-3 py-2">
      {/* Tam ekran — en solda */}
      <IconButton
        label={props.isFullscreen ? t('preview.exitFullscreen') : t('preview.fullscreen')}
        onClick={props.onToggleFullscreen}
      >
        {props.isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </IconButton>

      {/* Zoom grubu */}
      <IconButton label={t('preview.zoomOut')} onClick={props.zoomOut} disabled={props.zoom <= MIN_ZOOM}>
        <ZoomOut size={16} />
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
        <ZoomIn size={16} />
      </IconButton>
      <IconButton label={t('preview.fitToScreen')} onClick={props.onFit}>
        <Frame size={16} />
      </IconButton>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <div className="relative ml-auto flex items-center gap-1.5">
        {/* İçe aktar */}
        <Tooltip label={t('preview.importTooltip')} side="bottom">
          <Button onClick={props.onImport} disabled={props.importing}>
            <FileUp size={14} />
            <span className="hidden @sm:inline">{props.importing ? t('preview.importLoading') : t('preview.import')}</span>
          </Button>
        </Tooltip>

        {/* Dışa aktar */}
        <Tooltip label={t('preview.exportTooltip')} side="bottom">
          <Button
            variant="primary"
            disabled={props.hasError}
            onClick={() => setExportMenu((v) => !v)}
          >
            <Download size={14} />
            <span className="hidden @sm:inline">{t('preview.export')}</span>
          </Button>
        </Tooltip>
        {exportMenu ? (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closeAllMenus}
              aria-hidden
            />
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-bg-surface py-1 text-sm shadow-lg" style={{ top: '100%' }}>
              <MenuItem onClick={() => { props.onPng(); setExportMenu(false) }}>{t('preview.pngImage')}</MenuItem>
              <MenuItem onClick={() => { props.onSvg(); setExportMenu(false) }}>{t('preview.svgVector')}</MenuItem>
              <div className="my-1 h-px bg-border" />
              <MenuItem onClick={() => { props.onMd(); setExportMenu(false) }}>{t('preview.markdown')}</MenuItem>
              <MenuItem onClick={() => { props.onMmd(); setExportMenu(false) }}>{t('preview.mermaidSource')}</MenuItem>
              <MenuItem onClick={() => { props.onJson(); setExportMenu(false) }}>{t('preview.project')}</MenuItem>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}


