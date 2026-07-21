import webpush from "web-push"

import { env } from "@/env"
import type { PushSubscriptionJson } from "@/lib/db/subscriptions"

export type NotificationPayload = {
  title: string
  body: string
}

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_PUBLIC_KEY, env.PRIVATE_KEY)
  vapidConfigured = true
}

export async function sendPushNotification(
  subscription: PushSubscriptionJson,
  payload: NotificationPayload,
) {
  ensureVapid()

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    },
    JSON.stringify(payload),
    {
      urgency: "high",
      TTL: 30,
    },
  )
}

export function isGoneSubscriptionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode?: number }).statusCode === 410
  )
}
