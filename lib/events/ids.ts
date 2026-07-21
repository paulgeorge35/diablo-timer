import { ALL_EVENT_IDS, DEFAULT_NOTIFY_EVENT_IDS, type EventId } from "./config"

export function isEventId(value: unknown): value is EventId {
  return typeof value === "string" && (ALL_EVENT_IDS as readonly string[]).includes(value)
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
