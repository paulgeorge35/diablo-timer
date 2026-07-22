import { SANCTUARY_EVENT_IDS, eventPath, type EventId } from "@/lib/events"

export type EventSeoCopy = {
  title: string
  description: string
  path: string
}

const EVENT_SEO: Record<EventId, EventSeoCopy> = {
  "world-boss": {
    title: "World Boss Tracker",
    description:
      "Live Diablo 4 World Boss countdown — track Avarice, Ashava, Azmodan, and Wandering Death spawns with optional push alerts.",
    path: "/",
  },
  legion: {
    title: "Legion Tracker",
    description:
      "Live Diablo 4 Legion event countdown — never miss the next Legion assault. Optional push alerts included.",
    path: "/legion",
  },
  helltide: {
    title: "Helltide Tracker",
    description:
      "Live Diablo 4 Helltide countdown — know when the next Helltide starts and ends. Optional push alerts included.",
    path: "/helltide",
  },
  realmwalker: {
    title: "Realmwalker Tracker",
    description:
      "Live Diablo 4 Realmwalker countdown — track the next Realmwalker spawn. Optional push alerts included.",
    path: "/realmwalker",
  },
}

export function getEventSeo(eventId: EventId): EventSeoCopy {
  return EVENT_SEO[eventId]
}

export function getSanctuaryEventSeoList(): EventSeoCopy[] {
  return SANCTUARY_EVENT_IDS.map((eventId) => EVENT_SEO[eventId])
}

export function absoluteEventUrl(eventId: EventId, siteUrl: string): string {
  const path = eventPath(eventId)
  return path === "/" ? siteUrl : `${siteUrl}${path}`
}
