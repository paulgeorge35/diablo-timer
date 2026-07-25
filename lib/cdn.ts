const CDN_ROOT = "https://api.cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m"

export type CdnImageParams = {
  w?: number
  h?: number
  q?: number
}

/** Build a CDN image URL from an asset id and optional resize/quality params. */
export function cdnImageUrl(id: string, params: CdnImageParams = {}): string {
  const query = new URLSearchParams()
  if (params.w !== undefined) query.set("w", String(params.w))
  if (params.h !== undefined) query.set("h", String(params.h))
  if (params.q !== undefined) query.set("q", String(params.q))

  const qs = query.toString()
  return qs ? `${CDN_ROOT}/${id}?${qs}` : `${CDN_ROOT}/${id}`
}

/** Shared background art, reused by the app shell and the social images. */
export const BACKGROUND_IMAGE_ID = "cmrtr2cnj000801lk1g6tbyoq"
