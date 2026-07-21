"use client"

import { Bell, BellOff } from "lucide-react"
import { useEffect, useState } from "react"

import { env } from "@/env"
import {
  ALL_EVENT_IDS,
  DEFAULT_NOTIFY_EVENT_IDS,
  EVENTS,
  type EventId,
} from "@/lib/events"

type Status = "loading" | "unsupported" | "denied" | "unsubscribed" | "subscribed"

const notificationsSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window

async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

function toggleEvent(selected: EventId[], eventId: EventId): EventId[] {
  if (selected.includes(eventId)) {
    return selected.filter((id) => id !== eventId)
  }
  return [...selected, eventId]
}

export default function Notifications() {
  const [status, setStatus] = useState<Status>("loading")
  const [busy, setBusy] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<EventId[]>(DEFAULT_NOTIFY_EVENT_IDS)
  const [savedEvents, setSavedEvents] = useState<EventId[]>(DEFAULT_NOTIFY_EVENT_IDS)

  useEffect(() => {
    let cancelled = false

    const syncStatus = async () => {
      if (!notificationsSupported()) {
        if (!cancelled) setStatus("unsupported")
        return
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied")
        return
      }

      try {
        const subscription = await getPushSubscription()
        if (!subscription) {
          if (!cancelled) setStatus("unsubscribed")
          return
        }

        const prefs = await fetchPreferences(subscription.endpoint)
        if (!cancelled) {
          setSelectedEvents(prefs)
          setSavedEvents(prefs)
          setStatus("subscribed")
        }
      } catch {
        if (!cancelled) setStatus("unsubscribed")
      }
    }

    void syncStatus()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === "loading" || status === "unsupported" || status === "denied") {
    return null
  }

  const preferencesDirty =
    status === "subscribed" &&
    (selectedEvents.length !== savedEvents.length ||
      selectedEvents.some((id) => !savedEvents.includes(id)))

  const handleSubscribe = async () => {
    if (selectedEvents.length === 0) return
    setBusy(true)
    try {
      await subscribe(selectedEvents)
      setSavedEvents(selectedEvents)
      setStatus("subscribed")
    } catch (err) {
      console.error("Subscribe error:", err)
    } finally {
      setBusy(false)
    }
  }

  const handleSavePreferences = async () => {
    if (selectedEvents.length === 0) return
    setBusy(true)
    try {
      const subscription = await getPushSubscription()
      if (!subscription) {
        setStatus("unsubscribed")
        return
      }
      await savePreferences(subscription.endpoint, selectedEvents)
      setSavedEvents(selectedEvents)
    } catch (err) {
      console.error("Save preferences error:", err)
    } finally {
      setBusy(false)
    }
  }

  const handleUnsubscribe = async () => {
    setBusy(true)
    try {
      await unsubscribe()
      setSelectedEvents(DEFAULT_NOTIFY_EVENT_IDS)
      setSavedEvents(DEFAULT_NOTIFY_EVENT_IDS)
      setStatus("unsubscribed")
    } catch (err) {
      console.error("Unsubscribe error:", err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <fieldset className="w-full text-left">
        <legend className="font-diablo-light mb-2 text-center text-xs tracking-wide text-muted-foreground">
          Notify me for
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {ALL_EVENT_IDS.map((eventId) => {
            const checked = selectedEvents.includes(eventId)
            return (
              <label
                key={eventId}
                className={`font-diablo-light flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground hover:border-border"
                }`}
              >
                <input
                  type="checkbox"
                  className="size-3.5 accent-[hsl(var(--primary))]"
                  checked={checked}
                  disabled={busy}
                  onChange={() => setSelectedEvents((prev) => toggleEvent(prev, eventId))}
                />
                <span>{EVENTS[eventId].name}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {status === "subscribed" ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {preferencesDirty ? (
            <button
              type="button"
              disabled={busy || selectedEvents.length === 0}
              onClick={handleSavePreferences}
              className="font-diablo-light ease inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97] disabled:opacity-50"
            >
              <span>{busy ? "Saving…" : "Save Preferences"}</span>
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={handleUnsubscribe}
            className="font-diablo-light ease inline-flex items-center gap-2 border border-border px-5 py-3 text-sm text-muted-foreground transition-[background-color,border-color,transform,color] duration-150 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] disabled:opacity-50"
          >
            <BellOff className="size-4 shrink-0" aria-hidden="true" />
            <span>{busy ? "Disabling…" : "Disable Notifications"}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy || selectedEvents.length === 0}
          onClick={handleSubscribe}
          className="font-diablo-light ease inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97] disabled:opacity-50"
        >
          <Bell className="size-4 shrink-0" aria-hidden="true" />
          <span>{busy ? "Enabling…" : "Enable Notifications"}</span>
        </button>
      )}
    </div>
  )
}

const unregisterServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

const registerServiceWorker = async () => {
  return navigator.serviceWorker.register("/service.js")
}

const subscribe = async (eventIds: EventId[]) => {
  await unregisterServiceWorkers()

  const swRegistration = await registerServiceWorker()
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error("Notification permission not granted")
  }

  const options = {
    applicationServerKey: env.NEXT_PUBLIC_PUBLIC_KEY,
    userVisibleOnly: true,
  }
  const subscription = await swRegistration.pushManager.subscribe(options)
  await saveSubscription(subscription, eventIds)
}

const unsubscribe = async () => {
  const subscription = await getPushSubscription()
  if (!subscription) {
    await unregisterServiceWorkers()
    return
  }

  await removeSubscription(subscription.endpoint)
  await subscription.unsubscribe()
  await unregisterServiceWorkers()
}

const saveSubscription = async (subscription: PushSubscription, eventIds: EventId[]) => {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/subscription/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription, eventIds }),
  })

  if (!response.ok) {
    throw new Error("Failed to save subscription")
  }

  return response.json()
}

const fetchPreferences = async (endpoint: string): Promise<EventId[]> => {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/subscription/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  })

  if (!response.ok) {
    return DEFAULT_NOTIFY_EVENT_IDS
  }

  const data: unknown = await response.json()
  if (
    data &&
    typeof data === "object" &&
    "eventIds" in data &&
    Array.isArray((data as { eventIds: unknown }).eventIds)
  ) {
    const ids = (data as { eventIds: unknown[] }).eventIds.filter(
      (id): id is EventId => typeof id === "string" && (ALL_EVENT_IDS as readonly string[]).includes(id),
    )
    return ids.length > 0 ? ids : DEFAULT_NOTIFY_EVENT_IDS
  }

  return DEFAULT_NOTIFY_EVENT_IDS
}

const savePreferences = async (endpoint: string, eventIds: EventId[]) => {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/subscription/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint, eventIds }),
  })

  if (!response.ok) {
    throw new Error("Failed to save preferences")
  }

  return response.json()
}

const removeSubscription = async (endpoint: string) => {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/subscription/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  })

  if (!response.ok) {
    throw new Error("Failed to remove subscription")
  }

  return response.json()
}
