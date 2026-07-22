"use client"

import { useEffect } from "react"

import { trackNotificationClicked } from "@/lib/analytics"

type NotificationClickMessage = {
  type: "NOTIFICATION_CLICK"
  eventId?: string
  bossName?: string
}

function isNotificationClickMessage(value: unknown): value is NotificationClickMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type?: unknown }).type === "NOTIFICATION_CLICK"
  )
}

function clearPushQueryParams() {
  const url = new URL(window.location.href)
  if (url.searchParams.get("ref") !== "push") return

  url.searchParams.delete("ref")
  url.searchParams.delete("event_id")
  url.searchParams.delete("boss")
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, "", next)
}

function trackClickWhenReady(properties: {
  eventId?: string
  bossName?: string
  source: "url" | "service_worker"
}) {
  let attempts = 0
  const run = () => {
    const ready = "op" in window
    if (ready || attempts >= 25) {
      trackNotificationClicked(properties)
      return
    }
    attempts += 1
    window.setTimeout(run, 100)
  }
  run()
}

/** Tracks push notification clicks from URL params (cold start) or SW postMessage (warm). */
export function NotificationClickTracker() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("ref") === "push") {
      trackClickWhenReady({
        eventId: url.searchParams.get("event_id") ?? undefined,
        bossName: url.searchParams.get("boss") ?? undefined,
        source: "url",
      })
      clearPushQueryParams()
    }

    const onMessage = (event: MessageEvent) => {
      if (!isNotificationClickMessage(event.data)) return
      trackClickWhenReady({
        eventId: event.data.eventId,
        bossName: event.data.bossName,
        source: "service_worker",
      })
    }

    navigator.serviceWorker?.addEventListener("message", onMessage)
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage)
  }, [])

  return null
}
