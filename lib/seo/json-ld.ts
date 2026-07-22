import { ALL_EVENT_IDS, EVENTS } from "@/lib/events"

import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "./site"

type JsonLd = Record<string, unknown>

export function buildWebsiteJsonLd(): JsonLd {
  const siteUrl = getSiteUrl()

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
  }
}

export function buildWebApplicationJsonLd(): JsonLd {
  const siteUrl = getSiteUrl()

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }
}

export function buildEventsItemListJsonLd(): JsonLd {
  const siteUrl = getSiteUrl()

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Diablo 4 Sanctuary Events",
    itemListElement: ALL_EVENT_IDS.map((eventId, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: EVENTS[eventId].name,
      url: siteUrl,
      description: `${EVENTS[eventId].name} spawn tracker for Diablo 4`,
    })),
  }
}

export function buildHomeJsonLd(): JsonLd[] {
  return [buildWebsiteJsonLd(), buildWebApplicationJsonLd(), buildEventsItemListJsonLd()]
}
