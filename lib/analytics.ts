import type { EventId } from "@/lib/events"

type AnalyticsValue = string | number | boolean | string[] | null | undefined
type AnalyticsProperties = Record<string, AnalyticsValue>

/** Client-side OpenPanel track — no-ops when the SDK isn't loaded. */
export function track(name: string, properties?: AnalyticsProperties) {
  if (typeof window === "undefined") return
  try {
    window.op?.("track", name, properties)
  } catch {
    // Analytics must never break the app
  }
}

export function trackNotificationsDialogOpened(status: "subscribed" | "unsubscribed") {
  track("notifications_dialog_opened", { status })
}

export function trackNotificationsSubscribe(eventIds: EventId[]) {
  track("notifications_subscribe", {
    event_ids: eventIds,
    event_count: eventIds.length,
  })
}

export function trackNotificationsSubscribeFailed(reason: string) {
  track("notifications_subscribe_failed", { reason })
}

export function trackNotificationsUnsubscribe() {
  track("notifications_unsubscribe")
}

export function trackNotificationsUnsubscribeFailed(reason: string) {
  track("notifications_unsubscribe_failed", { reason })
}

export function trackNotificationsPreferencesSaved(
  eventIds: EventId[],
  previousEventIds: EventId[],
) {
  const added = eventIds.filter((id) => !previousEventIds.includes(id))
  const removed = previousEventIds.filter((id) => !eventIds.includes(id))
  track("notifications_preferences_saved", {
    event_ids: eventIds,
    event_count: eventIds.length,
    added,
    removed,
    added_count: added.length,
    removed_count: removed.length,
  })
}

export function trackNotificationsPreferencesSaveFailed(reason: string) {
  track("notifications_preferences_save_failed", { reason })
}

export function trackNotificationsUnavailable(reason: "unsupported" | "denied") {
  track("notifications_unavailable", { reason })
}

export function trackNotificationsSessionRestored(eventIds: EventId[]) {
  track("notifications_session_restored", {
    event_ids: eventIds,
    event_count: eventIds.length,
  })
}

export function trackNotificationClicked(properties: {
  eventId?: string
  bossName?: string
  source: "url" | "service_worker"
}) {
  track("notification_clicked", {
    event_id: properties.eventId ?? null,
    boss_name: properties.bossName ?? null,
    source: properties.source,
  })
}
