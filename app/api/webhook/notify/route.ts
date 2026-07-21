import { DateTime } from "luxon"
import { NextResponse } from "next/server"

import { env } from "@/env"
import prisma from "@/lib/db"
import {
  deleteSubscription,
  getSubscriptionsForEvent,
  parseSubscriptionJson,
} from "@/lib/db/subscriptions"
import { ALL_EVENT_IDS, EVENTS, bossAtStart, getUpcomingStart, type EventId } from "@/lib/events"
import { isGoneSubscriptionError, sendPushNotification } from "@/lib/notifications/send"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false
  return authHeader === `Bearer ${env.WEBHOOK_SECRET}`
}

async function claimDispatch(eventId: EventId, eventAt: DateTime) {
  try {
    await prisma.notificationDispatch.create({
      data: {
        eventId,
        eventAt: eventAt.toJSDate(),
      },
    })
    return "claimed" as const
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return "already_dispatched" as const
    }
    throw error
  }
}

async function notifyEvent(eventId: EventId, now: DateTime) {
  const eventAt = getUpcomingStart(eventId, now)
  const notifyFrom = eventAt.minus({ minutes: env.NOTIFY_MINUTES_BEFORE_EVENT })

  if (now < notifyFrom || now >= eventAt) {
    return {
      eventId,
      skipped: true as const,
      reason: "outside_notify_window" as const,
      eventAt: eventAt.toISO(),
    }
  }

  const claim = await claimDispatch(eventId, eventAt)
  if (claim === "already_dispatched") {
    return {
      eventId,
      skipped: true as const,
      reason: "already_dispatched" as const,
      eventAt: eventAt.toISO(),
    }
  }

  const minutesUntil = Math.max(1, Math.ceil(eventAt.diff(now, "minutes").minutes))
  const event = EVENTS[eventId]
  const bossName = bossAtStart(eventId, eventAt)
  const payload = {
    title: bossName ? `${bossName} Alert!` : `${event.name} Alert!`,
    body: bossName
      ? `${bossName} is spawning in ${minutesUntil} minutes!`
      : `A new ${event.name} event is starting in ${minutesUntil} minutes!`,
  }

  const subscriptions = await getSubscriptionsForEvent(eventId)
  const results = await Promise.all(
    subscriptions.map(async (row) => {
      try {
        const subscription = parseSubscriptionJson(row.subscription)
        await sendPushNotification(subscription, payload)
        return { status: "sent" as const }
      } catch (error) {
        console.error(`Failed to notify subscription ${row.id} for ${eventId}:`, error)

        if (isGoneSubscriptionError(error)) {
          await deleteSubscription(row.id)
          return { status: "deleted" as const }
        }

        return { status: "failed" as const }
      }
    }),
  )

  return {
    eventId,
    skipped: false as const,
    eventAt: eventAt.toISO(),
    minutesUntil,
    total: subscriptions.length,
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed" || r.status === "deleted").length,
    deleted: results.filter((r) => r.status === "deleted").length,
  }
}

async function handleNotify() {
  const now = DateTime.utc()
  const results = await Promise.all(ALL_EVENT_IDS.map((eventId) => notifyEvent(eventId, now)))
  const notified = results.filter((r) => !r.skipped)

  return NextResponse.json({
    skipped: notified.length === 0,
    now: now.toISO(),
    results,
  })
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return handleNotify()
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return handleNotify()
}
