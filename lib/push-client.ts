import { env } from "@/env"
import { DEFAULT_NOTIFY_EVENT_IDS, type EventId, parseEventIdsPayload } from "@/lib/events"

export function notificationsSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  )
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

async function postJson(path: string, body: unknown) {
  return fetch(`${env.NEXT_PUBLIC_APP_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const unregisterServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

const registerServiceWorker = async () => navigator.serviceWorker.register("/service.js")

const saveSubscription = async (subscription: PushSubscription, eventIds: EventId[]) => {
  const response = await postJson("/api/subscription/save", { subscription, eventIds })
  if (!response.ok) throw new Error("Failed to save subscription")
  return response.json()
}

export const removeSubscription = async (endpoint: string) => {
  const response = await postJson("/api/subscription/remove", { endpoint })
  if (!response.ok) throw new Error("Failed to remove subscription")
  return response.json()
}

export const subscribe = async (eventIds: EventId[]) => {
  await unregisterServiceWorkers()

  const swRegistration = await registerServiceWorker()
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error("Notification permission not granted")
  }

  const subscription = await swRegistration.pushManager.subscribe({
    applicationServerKey: env.NEXT_PUBLIC_PUBLIC_KEY,
    userVisibleOnly: true,
  })
  await saveSubscription(subscription, eventIds)
}

export const unsubscribe = async () => {
  const subscription = await getPushSubscription()
  if (!subscription) {
    await unregisterServiceWorkers()
    return
  }

  await removeSubscription(subscription.endpoint)
  await subscription.unsubscribe()
  await unregisterServiceWorkers()
}

export const fetchPreferences = async (endpoint: string): Promise<EventId[]> => {
  const response = await postJson("/api/subscription/preferences", { endpoint })
  if (!response.ok) return DEFAULT_NOTIFY_EVENT_IDS
  const data: unknown = await response.json()
  return parseEventIdsPayload(data)
}

export const savePreferences = async (endpoint: string, eventIds: EventId[]) => {
  const response = await postJson("/api/subscription/preferences", { endpoint, eventIds })
  if (!response.ok) throw new Error("Failed to save preferences")
  return response.json()
}
