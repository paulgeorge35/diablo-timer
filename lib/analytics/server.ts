import { OpenPanel } from "@openpanel/nextjs"

import { env } from "@/env"
import type { EventId } from "@/lib/events"

type AnalyticsProperties = Record<string, string | number | boolean | string[] | null | undefined>

let client: OpenPanel | null | undefined

function getServerAnalytics(): OpenPanel | null {
  if (client !== undefined) return client

  const clientId = env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
  const clientSecret = env.OPENPANEL_SECRET
  const apiUrl = env.NEXT_PUBLIC_OPENPANEL_API_URL

  if (!clientId || !clientSecret || !apiUrl) {
    client = null
    return client
  }

  client = new OpenPanel({
    clientId,
    clientSecret,
    apiUrl,
  })
  return client
}

/** Fire-and-await server event; never throws into request handlers. */
export async function trackServer(name: string, properties?: AnalyticsProperties) {
  const op = getServerAnalytics()
  if (!op) return

  try {
    await op.track(name, properties)
  } catch (error) {
    console.error(`OpenPanel track failed (${name}):`, error)
  }
}

export function trackSubscriptionSaved(eventIds: EventId[]) {
  return trackServer("subscription_saved", {
    event_ids: eventIds,
    event_count: eventIds.length,
  })
}

export function trackSubscriptionRemoved() {
  return trackServer("subscription_removed")
}

export function trackSubscriptionPreferencesUpdated(eventIds: EventId[]) {
  return trackServer("subscription_preferences_updated", {
    event_ids: eventIds,
    event_count: eventIds.length,
  })
}

export function trackPushDispatch(payload: {
  eventId: EventId
  eventAt: string | null
  minutesUntil: number
  total: number
  sent: number
  failed: number
  deleted: number
  bossName?: string
}) {
  return trackServer("push_dispatch", {
    event_id: payload.eventId,
    event_at: payload.eventAt,
    minutes_until: payload.minutesUntil,
    total: payload.total,
    sent: payload.sent,
    failed: payload.failed,
    deleted: payload.deleted,
    boss_name: payload.bossName ?? null,
  })
}
