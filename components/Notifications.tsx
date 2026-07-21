"use client"

import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

import { env } from "@/env"

const notificationsSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window

export default function Notifications() {
  const router = useRouter()

  if (!notificationsSupported() || Notification.permission === "granted") {
    return null
  }

  const handleSubscribe = async () => {
    await subscribe()
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      className="font-diablo-light ease inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/70 hover:bg-primary/20 active:scale-[0.97]"
    >
      <Bell className="size-4 shrink-0" aria-hidden="true" />
      <span>Enable Notifications</span>
    </button>
  )
}

export const unregisterServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

const registerServiceWorker = async () => {
  return navigator.serviceWorker.register("/service.js")
}

const subscribe = async () => {
  await unregisterServiceWorkers()

  const swRegistration = await registerServiceWorker()
  await Notification.requestPermission()

  try {
    const options = {
      applicationServerKey: env.NEXT_PUBLIC_PUBLIC_KEY,
      userVisibleOnly: true,
    }
    const subscription = await swRegistration.pushManager.subscribe(options)

    await saveSubscription(subscription)
  } catch (err) {
    console.error("Error", err)
  }
}

const saveSubscription = async (subscription: PushSubscription) => {
  const BACKEND_URL = `${env.NEXT_PUBLIC_APP_URL}/api/subscription/save`

  const response = await fetch(BACKEND_URL, {
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
