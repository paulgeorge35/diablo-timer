"use client"

import { Bell, BellOff, Settings2, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { env } from "@/env"
import { ALL_EVENT_IDS, DEFAULT_NOTIFY_EVENT_IDS, EVENTS, type EventId } from "@/lib/events"
import { useNotificationPrefs } from "@/lib/notification-prefs"

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
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const busyRef = useRef(false)
  const setPreferences = useNotificationPrefs((s) => s.setPreferences)
  const clearPreferences = useNotificationPrefs((s) => s.clearPreferences)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>("loading")
  const [busy, setBusy] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<EventId[]>(DEFAULT_NOTIFY_EVENT_IDS)
  const [savedEvents, setSavedEvents] = useState<EventId[]>(DEFAULT_NOTIFY_EVENT_IDS)

  busyRef.current = busy

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
          if (!cancelled) {
            clearPreferences()
            setStatus("unsubscribed")
          }
          return
        }

        const prefs = await fetchPreferences(subscription.endpoint)
        if (!cancelled) {
          setSelectedEvents(prefs)
          setSavedEvents(prefs)
          setPreferences(prefs)
          setStatus("subscribed")
        }
      } catch {
        if (!cancelled) {
          clearPreferences()
          setStatus("unsubscribed")
        }
      }
    }

    void syncStatus()
    return () => {
      cancelled = true
    }
  }, [clearPreferences, setPreferences])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const onBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog || busyRef.current) return
      setOpen(false)
    }

    dialog.addEventListener("click", onBackdropClick)
    return () => dialog.removeEventListener("click", onBackdropClick)
  }, [status])

  if (status === "loading" || status === "unsupported" || status === "denied") {
    return null
  }

  const preferencesDirty =
    status === "subscribed" &&
    (selectedEvents.length !== savedEvents.length ||
      selectedEvents.some((id) => !savedEvents.includes(id)))

  const openDialog = () => {
    setSelectedEvents(status === "subscribed" ? savedEvents : DEFAULT_NOTIFY_EVENT_IDS)
    setOpen(true)
  }

  const closeDialog = () => {
    if (busy) return
    setSelectedEvents(status === "subscribed" ? savedEvents : DEFAULT_NOTIFY_EVENT_IDS)
    setOpen(false)
  }

  const handleSubscribe = async () => {
    if (selectedEvents.length === 0) return
    setBusy(true)
    try {
      await subscribe(selectedEvents)
      setSavedEvents(selectedEvents)
      setPreferences(selectedEvents)
      setStatus("subscribed")
      setOpen(false)
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
        clearPreferences()
        setStatus("unsubscribed")
        return
      }
      await savePreferences(subscription.endpoint, selectedEvents)
      setSavedEvents(selectedEvents)
      setPreferences(selectedEvents)
      setOpen(false)
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
      clearPreferences()
      setStatus("unsubscribed")
      setOpen(false)
    } catch (err) {
      console.error("Unsubscribe error:", err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="font-diablo-light ease inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97]"
      >
        {status === "subscribed" ? (
          <>
            <Settings2 className="size-4 shrink-0" aria-hidden="true" />
            <span>Manage Notifications</span>
          </>
        ) : (
          <>
            <Bell className="size-4 shrink-0" aria-hidden="true" />
            <span>Enable Notifications</span>
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto max-h-[min(90vh,36rem)] w-[min(100%-2rem,24rem)] border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/70 open:flex open:flex-col"
        onCancel={(event) => {
          if (busy) event.preventDefault()
        }}
        onClose={() => {
          setSelectedEvents(status === "subscribed" ? savedEvents : DEFAULT_NOTIFY_EVENT_IDS)
          setOpen(false)
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="font-diablo-heavy text-lg tracking-wide">
              {status === "subscribed" ? "Notification Settings" : "Enable Notifications"}
            </h2>
            <p className="font-diablo-light mt-1 text-xs text-muted-foreground">
              Choose which Sanctuary events should alert you.
            </p>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            disabled={busy}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <fieldset className="flex-1 overflow-y-auto px-5 py-4">
          <legend className="font-diablo-light pt-4 text-xs tracking-wide text-muted-foreground">
            Notify me for
          </legend>
          <div className="grid gap-2">
            {ALL_EVENT_IDS.map((eventId) => {
              const checked = selectedEvents.includes(eventId)
              return (
                <label
                  key={eventId}
                  className={`font-diablo-light flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm transition-colors ${
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

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
          {status === "subscribed" ? (
            <>
              <button
                type="button"
                disabled={busy || selectedEvents.length === 0 || !preferencesDirty}
                onClick={handleSavePreferences}
                className="font-diablo-light ease inline-flex w-full items-center justify-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97] disabled:opacity-50"
              >
                <span>{busy ? "Saving…" : "Save Preferences"}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleUnsubscribe}
                className="font-diablo-light ease inline-flex w-full items-center justify-center gap-2 border border-border px-5 py-3 text-sm text-muted-foreground transition-[background-color,border-color,transform,color] duration-150 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] disabled:opacity-50"
              >
                <BellOff className="size-4 shrink-0" aria-hidden="true" />
                <span>{busy ? "Disabling…" : "Disable Notifications"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy || selectedEvents.length === 0}
              onClick={handleSubscribe}
              className="font-diablo-light ease inline-flex w-full items-center justify-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97] disabled:opacity-50"
            >
              <Bell className="size-4 shrink-0" aria-hidden="true" />
              <span>{busy ? "Enabling…" : "Enable Notifications"}</span>
            </button>
          )}
        </div>
      </dialog>
    </>
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
      (id): id is EventId =>
        typeof id === "string" && (ALL_EVENT_IDS as readonly string[]).includes(id),
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
