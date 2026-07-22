export {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OG_ALT,
  SITE_SOCIAL_DESCRIPTION,
  SITE_TAGLINE,
  getSiteUrl,
} from "./site"
export { createEventMetadata, createRootMetadata } from "./metadata"
export {
  buildEventPageJsonLd,
  buildEventsItemListJsonLd,
  buildHomeJsonLd,
  buildWebApplicationJsonLd,
  buildWebsiteJsonLd,
} from "./json-ld"
export {
  absoluteEventUrl,
  getEventSeo,
  getSanctuaryEventSeoList,
  type EventSeoCopy,
} from "./events"
