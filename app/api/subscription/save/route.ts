import { type NextRequest, NextResponse } from "next/server"

import { env } from "@/env"
import {
  type PushSubscriptionJson,
  upsertSubscription,
} from "@/lib/db/subscriptions"
import { DEFAULT_NOTIFY_EVENT_IDS, parseEventIds } from "@/lib/events"

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

function isPushSubscription(value: unknown): value is PushSubscriptionJson {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  const keys = candidate.keys
  if (!keys || typeof keys !== "object") return false
  const keyRecord = keys as Record<string, unknown>
  return (
    typeof candidate.endpoint === "string" &&
    candidate.endpoint.length > 0 &&
    typeof keyRecord.p256dh === "string" &&
    typeof keyRecord.auth === "string"
  )
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin")
    const allowedOrigin = env.APP_URL

    if (!origin || origin !== allowedOrigin) {
      return new NextResponse("Unauthorized", {
        status: 401,
        statusText: "Unauthorized",
      })
    }

    const data: unknown = await req.json()
    if (!data || typeof data !== "object") {
      return new NextResponse("Invalid subscription data", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    const body = data as {
      subscription?: unknown
      eventIds?: unknown
    }

    // Back-compat: body may be the PushSubscription itself.
    const subscriptionValue = body.subscription ?? data
    if (!isPushSubscription(subscriptionValue)) {
      return new NextResponse("Invalid subscription data", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    const eventIds = parseEventIds(body.eventIds) ?? DEFAULT_NOTIFY_EVENT_IDS
    const row = await upsertSubscription(subscriptionValue, eventIds)

    return NextResponse.json(
      { success: true, eventIds: row.eventIds },
      { headers: corsHeaders(allowedOrigin) },
    )
  } catch (error) {
    console.error("Subscription error:", error)
    return new NextResponse("Internal Server Error", {
      status: 500,
      statusText: "Internal Server Error",
    })
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin")
  const allowedOrigin = env.APP_URL

  if (!origin || origin !== allowedOrigin) {
    return new NextResponse(null, { status: 204 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(allowedOrigin),
  })
}
