import { DateTime } from "luxon"
import { NextResponse } from "next/server"

import { env } from "@/env"
import prisma from "@/lib/db"
import {
  deleteSubscription,
  getAllSubscriptions,
  parseSubscriptionJson,
} from "@/lib/db/subscriptions"
import { EVENTS, getIntervalState } from "@/lib/events"
import { isGoneSubscriptionError, sendPushNotification } from "@/lib/notifications/send"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WORLD_BOSS_EVENT_ID = "world-boss" as const

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false
  return authHeader === `Bearer ${env.WEBHOOK_SECRET}`
}

async function handleNotify() {
  const now = DateTime.utc()
  const worldBoss = EVENTS["world-boss"]
  const state = getIntervalState(worldBoss.baseline, worldBoss.intervalMs, now, 0)
  const eventAt = state.start
  const notifyFrom = eventAt.minus({ minutes: env.NOTIFY_MINUTES_BEFORE_EVENT })

  if (now < notifyFrom || now >= eventAt) {
    return NextResponse.json({
      skipped: true,
      reason: "outside_notify_window",
      eventAt: eventAt.toISO(),
      notifyFrom: notifyFrom.toISO(),
      now: now.toISO(),
    })
  }

  const eventAtDate = eventAt.toJSDate()

  try {
    await prisma.notificationDispatch.create({
      data: {
        eventId: WORLD_BOSS_EVENT_ID,
        eventAt: eventAtDate,
      },
    })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({
        skipped: true,
        reason: "already_dispatched",
        eventAt: eventAt.toISO(),
      })
    }
    throw error
  }

  const minutesUntil = Math.max(1, Math.ceil(eventAt.diff(now, "minutes").minutes))
  const payload = {
    title: "World Boss Alert!",
    body: `A new World Boss event is starting in ${minutesUntil} minutes!`,
  }

  const subscriptions = await getAllSubscriptions()

  const results = await Promise.all(
    subscriptions.map(async (row) => {
      try {
        const subscription = parseSubscriptionJson(row.subscription)
        await sendPushNotification(subscription, payload)
        return { status: "sent" as const }
      } catch (error) {
        console.error(`Failed to notify subscription ${row.id}:`, error)

        if (isGoneSubscriptionError(error)) {
          await deleteSubscription(row.id)
          return { status: "deleted" as const }
        }

        return { status: "failed" as const }
      }
    }),
  )

  const sent = results.filter((r) => r.status === "sent").length
  const deleted = results.filter((r) => r.status === "deleted").length
  const failed = results.filter((r) => r.status === "failed" || r.status === "deleted").length

  return NextResponse.json({
    skipped: false,
    eventAt: eventAt.toISO(),
    minutesUntil,
    total: subscriptions.length,
    sent,
    failed,
    deleted,
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
