export interface SharedProject {
  title: string
  description: string
  code: string
}

export type ShareErrorReason = 'invalid' | 'too-large' | 'unsupported' | 'copy-failed'

export class ShareLinkError extends Error {
  reason: ShareErrorReason

  constructor(reason: ShareErrorReason) {
    super(reason)
    this.reason = reason
  }
}

// Veri `#` sonrasında taşınır: fragment tarayıcıdan sunucuya hiç gönderilmez.
const HASH_PREFIX = '#s='

/** Biçim sürümleri: 1 = deflate-raw sıkıştırmalı, 0 = sıkıştırmasız (eski tarayıcı yedeği). */
const VERSION_PLAIN = '0'
const VERSION_DEFLATE = '1'

/** Çözülmüş içerik üst sınırı; kötü niyetli sıkıştırma bombasına ve devasa bağlantılara karşı. */
const MAX_DECODED_BYTES = 256 * 1024
const MAX_ENCODED_CHARS = 700_000

/** Bazı mesajlaşma uygulamaları bundan uzun bağlantıları keser. */
export const LONG_LINK_THRESHOLD = 8000

const canCompress = (): boolean =>
  typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  // String.fromCharCode argüman sayısı sınırlı; parça parça çevrilir.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new ShareLinkError('invalid')
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(binary, (c) => c.charCodeAt(0))
  } catch {
    throw new ShareLinkError('invalid')
  }
}

async function pipeThrough(
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream,
  limit = Infinity,
): Promise<Uint8Array> {
  const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(transform).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > limit) {
        await reader.cancel()
        throw new ShareLinkError('too-large')
      }
      chunks.push(value)
    }
  } catch (error) {
    // Bozuk deflate verisi akışı hata ile kapatır.
    throw error instanceof ShareLinkError ? error : new ShareLinkError('invalid')
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.byteLength
  }
  return out
}

export const isShareHash = (hash: string): boolean => hash.startsWith(HASH_PREFIX)

/** Belgeyi, açan kişinin içeriği görebileceği tek bir bağlantıya kodlar. */
export async function encodeShare(project: SharedProject): Promise<string> {
  const payload = JSON.stringify({
    t: project.title,
    ...(project.description ? { d: project.description } : {}),
    c: project.code,
  })
  const raw = new TextEncoder().encode(payload)
  const compressed = canCompress()
  const bytes = compressed ? await pipeThrough(raw, new CompressionStream('deflate-raw')) : raw
  const version = compressed ? VERSION_DEFLATE : VERSION_PLAIN
  return `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${version}.${toBase64Url(bytes)}`
}

/** Bağlantının `#s=…` kısmını çözer. Bozuk, aşırı büyük ya da bilinmeyen biçimde `ShareLinkError` fırlatır. */
export async function decodeShare(hash: string): Promise<SharedProject> {
  if (!isShareHash(hash)) throw new ShareLinkError('invalid')
  const body = hash.slice(HASH_PREFIX.length)
  if (body.length > MAX_ENCODED_CHARS) throw new ShareLinkError('too-large')

  const dot = body.indexOf('.')
  if (dot === -1) throw new ShareLinkError('invalid')
  const version = body.slice(0, dot)
  if (version !== VERSION_PLAIN && version !== VERSION_DEFLATE) throw new ShareLinkError('unsupported')

  const bytes = fromBase64Url(body.slice(dot + 1))
  let raw: Uint8Array
  if (version === VERSION_DEFLATE) {
    if (!canCompress()) throw new ShareLinkError('unsupported')
    raw = await pipeThrough(bytes, new DecompressionStream('deflate-raw'), MAX_DECODED_BYTES)
  } else {
    if (bytes.length > MAX_DECODED_BYTES) throw new ShareLinkError('too-large')
    raw = bytes
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw))
  } catch {
    throw new ShareLinkError('invalid')
  }
  const data = parsed as { t?: unknown; d?: unknown; c?: unknown } | null
  if (!data || typeof data !== 'object' || typeof data.c !== 'string') throw new ShareLinkError('invalid')
  if (data.t !== undefined && typeof data.t !== 'string') throw new ShareLinkError('invalid')
  if (data.d !== undefined && typeof data.d !== 'string') throw new ShareLinkError('invalid')
  return { title: data.t ?? '', description: data.d ?? '', code: data.c }
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    return
  } catch {
    // İzin yok ya da güvenli olmayan bağlam: eski yönteme düş.
  }
  const previous = document.activeElement as HTMLElement | null
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  const ok = document.execCommand('copy')
  field.remove()
  previous?.focus?.()
  if (!ok) throw new ShareLinkError('copy-failed')
}

// Masaüstü tarayıcıların çoğunda da `navigator.share` vardır; paylaşım menüsü yalnızca dokunmatik cihazlarda istenir.
const prefersNativeShare = (): boolean =>
  typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches

export type DeliveryResult = 'shared' | 'copied' | 'cancelled'

/**
 * Bağlantıyı mobilde sistem paylaşım menüsüyle, masaüstünde panoya kopyalayarak iletir.
 * Safari kullanıcı jestini `await` sonrasında geçersiz sayar; bu yüzden ilk çağrı `await`ten önce yapılır.
 */
export async function deliverShareLink(url: string, title: string): Promise<DeliveryResult> {
  if (prefersNativeShare()) {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Paylaşım menüsü açılamadı: panoya kopyalamaya düş.
    }
  }
  await copyToClipboard(url)
  return 'copied'
}
