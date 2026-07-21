"use client"

import { Bell, BellOff } from "lucide-react"
import { useEffect, useState } from "react"

import { env } from "@/env"

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

export default function Notifications() {
  const [status, setStatus] = useState<Status>("loading")
  const [busy, setBusy] = useState(false)

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
        if (!cancelled) {
          setStatus(subscription ? "subscribed" : "unsubscribed")
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

  const handleSubscribe = async () => {
    setBusy(true)
    try {
      await subscribe()
      setStatus("subscribed")
    } catch (err) {
      console.error("Subscribe error:", err)
    } finally {
      setBusy(false)
    }
  }

  const handleUnsubscribe = async () => {
    setBusy(true)
    try {
      await unsubscribe()
      setStatus("unsubscribed")
    } catch (err) {
      console.error("Unsubscribe error:", err)
    } finally {
      setBusy(false)
    }
  }

  if (status === "subscribed") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={handleUnsubscribe}
        className="font-diablo-light ease inline-flex items-center gap-2 border border-border px-5 py-3 text-sm text-muted-foreground transition-[background-color,border-color,transform,color] duration-150 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] disabled:opacity-50"
      >
        <BellOff className="size-4 shrink-0" aria-hidden="true" />
        <span>{busy ? "Disabling…" : "Disable Notifications"}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleSubscribe}
      className="font-diablo-light ease inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97] disabled:opacity-50"
    >
      <Bell className="size-4 shrink-0" aria-hidden="true" />
      <span>{busy ? "Enabling…" : "Enable Notifications"}</span>
    </button>
  )
}

const unregisterServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

const registerServiceWorker = async () => {
  return navigator.serviceWorker.register("/service.js")
}

const subscribe = async () => {
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
  await saveSubscription(subscription)
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

const saveSubscription = async (subscription: PushSubscription) => {
  const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/subscription/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  })

  if (!response.ok) {
    throw new Error("Failed to save subscription")
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
