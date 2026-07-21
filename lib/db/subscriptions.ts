import type { Prisma } from "@/generated/prisma/client"
import {
  DEFAULT_NOTIFY_EVENT_IDS,
  type EventId,
  parseEventIds,
} from "@/lib/events"

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

export function normalizeStoredEventIds(eventIds: string[]): EventId[] {
  const parsed = parseEventIds(eventIds)
  return parsed ?? DEFAULT_NOTIFY_EVENT_IDS
}

async function findIdsByEndpoint(endpoint: string) {
  const rows = await prisma.subscription.findMany()
  return rows
    .filter((row) => {
      try {
        return parseSubscriptionJson(row.subscription).endpoint === endpoint
      } catch {
        return false
      }
    })
    .map((row) => row.id)
}

export const upsertSubscription = async (
  subscription: PushSubscriptionJson,
  eventIds: EventId[] = DEFAULT_NOTIFY_EVENT_IDS,
) => {
  const matchingIds = await findIdsByEndpoint(subscription.endpoint)
  const data = {
    subscription: subscription as unknown as Prisma.InputJsonValue,
    eventIds,
  }

  if (matchingIds.length === 0) {
    return prisma.subscription.create({ data })
  }

  const [primaryId, ...duplicateIds] = matchingIds

  if (duplicateIds.length > 0) {
    await prisma.subscription.deleteMany({
      where: { id: { in: duplicateIds } },
    })
  }

  return prisma.subscription.update({
    where: { id: primaryId },
    data,
  })
}

export const getSubscription = async (id: string) => {
  return prisma.subscription.findUnique({ where: { id } })
}

export const getSubscriptionByEndpoint = async (endpoint: string) => {
  const matchingIds = await findIdsByEndpoint(endpoint)
  if (matchingIds.length === 0) return null
  return prisma.subscription.findUnique({ where: { id: matchingIds[0] } })
}

export const updateSubscriptionEventIds = async (endpoint: string, eventIds: EventId[]) => {
  const matchingIds = await findIdsByEndpoint(endpoint)
  if (matchingIds.length === 0) return { count: 0 }

  return prisma.subscription.updateMany({
    where: { id: { in: matchingIds } },
    data: { eventIds },
  })
}

export const getAllSubscriptions = async () => {
  return prisma.subscription.findMany()
}

export const getSubscriptionsForEvent = async (eventId: EventId) => {
  const rows = await prisma.subscription.findMany()
  return rows.filter((row) => normalizeStoredEventIds(row.eventIds).includes(eventId))
}

export const deleteSubscription = async (id: string) => {
  return prisma.subscription.delete({ where: { id } })
}

export const deleteSubscriptionsByEndpoint = async (endpoint: string) => {
  const matchingIds = await findIdsByEndpoint(endpoint)

  if (matchingIds.length === 0) {
    return { count: 0 }
  }

  return prisma.subscription.deleteMany({
    where: { id: { in: matchingIds } },
  })
}

export const deleteAllSubscriptions = async () => {
  return prisma.subscription.deleteMany()
}
