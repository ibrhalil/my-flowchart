import { useCallback, useEffect, useRef } from 'react'

export function useAutoGrowTextarea(maxHeightPx = 96) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxHeightPx)}px`
  }, [maxHeightPx])

  useEffect(() => {
    resize()
  }, [resize])

  return { ref, resize }
}
