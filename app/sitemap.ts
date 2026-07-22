import type { MetadataRoute } from "next"

import { ALL_EVENT_IDS } from "@/lib/events"
import { absoluteEventUrl, getSiteUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  return ALL_EVENT_IDS.map((eventId) => ({
    url: absoluteEventUrl(eventId, siteUrl),
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: eventId === "world-boss" ? 1 : 0.8,
  }))
}
