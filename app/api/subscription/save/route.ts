import { type NextRequest, NextResponse } from "next/server"

import { trackSubscriptionSaved } from "@/lib/analytics/server"
import {
  badRequest,
  corsHeaders,
  handleOptions,
  requireSameOrigin,
  serverError,
} from "@/lib/api/http"
import { type PushSubscriptionJson, upsertSubscription } from "@/lib/db/subscriptions"
import { DEFAULT_NOTIFY_EVENT_IDS, parseEventIds } from "@/lib/events"

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

export async function POST(request: NextRequest) {
  try {
    const auth = requireSameOrigin(request)
    if (auth instanceof NextResponse) return auth
    const { allowedOrigin } = auth

    const data: unknown = await request.json()
    if (!data || typeof data !== "object") {
      return badRequest("Invalid subscription data")
    }

    const body = data as { subscription?: unknown; eventIds?: unknown }

    // Back-compat: body may be the PushSubscription itself.
    const subscriptionValue = body.subscription ?? data
    if (!isPushSubscription(subscriptionValue)) {
      return badRequest("Invalid subscription data")
    }

    const eventIds = parseEventIds(body.eventIds) ?? DEFAULT_NOTIFY_EVENT_IDS
    const row = await upsertSubscription(subscriptionValue, eventIds)
    await trackSubscriptionSaved(eventIds)

    return NextResponse.json(
      { success: true, eventIds: row.eventIds },
      { headers: corsHeaders(allowedOrigin) },
    )
  } catch (error) {
    console.error("Subscription error:", error)
    return serverError()
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}
