import {
  ALL_EVENT_IDS,
  DEFAULT_NOTIFY_EVENT_IDS,
  SANCTUARY_EVENT_IDS,
  type EventId,
} from "./config"

export type SanctuaryEventId = (typeof SANCTUARY_EVENT_IDS)[number]

export function isEventId(value: unknown): value is EventId {
  return typeof value === "string" && (ALL_EVENT_IDS as readonly string[]).includes(value)
}

export function isSanctuaryEventId(value: unknown): value is SanctuaryEventId {
  return typeof value === "string" && (SANCTUARY_EVENT_IDS as readonly string[]).includes(value)
}

/**
 * Sanctuary section rows for a given hero.
 * On world-boss home: legion / helltide / realmwalker.
 * On a sanctuary page: world-boss first, then other sanctuary events excluding the hero.
 */
export function getSanctuaryRowIds(heroEventId: EventId): EventId[] {
  if (heroEventId === "world-boss") {
    return [...SANCTUARY_EVENT_IDS]
  }

  return ["world-boss", ...SANCTUARY_EVENT_IDS.filter((id) => id !== heroEventId)]
}

/** Canonical path for an event page (`/` for world-boss). */
export function eventPath(eventId: EventId): string {
  return eventId === "world-boss" ? "/" : `/${eventId}`
}

/** Filter an arbitrary value to a deduped list of valid event ids, or `null` if none are valid. */
export function parseEventIds(value: unknown): EventId[] | null {
  if (!Array.isArray(value)) return null
  const ids = value.filter(isEventId)
  return ids.length > 0 ? [...new Set(ids)] : null
}

/** Extract event ids from a `{ eventIds }` payload, falling back to the default selection. */
export function parseEventIdsPayload(data: unknown): EventId[] {
  if (data && typeof data === "object" && "eventIds" in data) {
    const parsed = parseEventIds((data as { eventIds: unknown }).eventIds)
    if (parsed) return parsed
  }
  return DEFAULT_NOTIFY_EVENT_IDS
}
