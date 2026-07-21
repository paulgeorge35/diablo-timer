import type { Prisma } from "@/generated/prisma/client"

import prisma from "./index"

export type PushSubscriptionJson = {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export function parseSubscriptionJson(value: Prisma.JsonValue): PushSubscriptionJson {
  let parsed: unknown = value

  // Legacy rows may be double-encoded JSON strings (Go notifier unescape path).
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed)
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed)
    }
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("endpoint" in parsed) ||
    !("keys" in parsed)
  ) {
    throw new Error("Invalid subscription JSON")
  }

  const subscription = parsed as PushSubscriptionJson

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error("Subscription missing required fields")
  }

  return subscription
}

export const addSubscription = async (subscription: PushSubscriptionJson) => {
  return prisma.subscription.create({
    data: {
      subscription: subscription as unknown as Prisma.InputJsonValue,
    },
  })
}

export const getSubscription = async (id: string) => {
  return prisma.subscription.findUnique({ where: { id } })
}

export const getAllSubscriptions = async () => {
  return prisma.subscription.findMany()
}

export const deleteSubscription = async (id: string) => {
  return prisma.subscription.delete({ where: { id } })
}

export const deleteAllSubscriptions = async () => {
  return prisma.subscription.deleteMany()
}
