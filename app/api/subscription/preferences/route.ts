import { type NextRequest, NextResponse } from "next/server"

import {
  badRequest,
  corsHeaders,
  handleOptions,
  readEndpoint,
  requireSameOrigin,
  serverError,
} from "@/lib/api/http"
import {
  getSubscriptionByEndpoint,
  normalizeStoredEventIds,
  updateSubscriptionEventIds,
} from "@/lib/db/subscriptions"
import { parseEventIds } from "@/lib/events"

export async function POST(request: NextRequest) {
  try {
    const auth = requireSameOrigin(request)
    if (auth instanceof NextResponse) return auth
    const { allowedOrigin } = auth

    const data: unknown = await request.json()
    const endpoint = readEndpoint(data)
    if (!endpoint) {
      return badRequest("Invalid endpoint")
    }

    const eventIdsInput =
      data && typeof data === "object" && "eventIds" in data
        ? (data as { eventIds?: unknown }).eventIds
        : undefined

    if (eventIdsInput === undefined) {
      const row = await getSubscriptionByEndpoint(endpoint)
      if (!row) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: corsHeaders(allowedOrigin) },
        )
      }

      return NextResponse.json(
        { eventIds: normalizeStoredEventIds(row.eventIds) },
        { headers: corsHeaders(allowedOrigin) },
      )
    }

    const eventIds = parseEventIds(eventIdsInput)
    if (!eventIds) {
      return badRequest("Select at least one event")
    }

    const result = await updateSubscriptionEventIds(endpoint, eventIds)
    if (result.count === 0) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: corsHeaders(allowedOrigin) },
      )
    }

    return NextResponse.json({ success: true, eventIds }, { headers: corsHeaders(allowedOrigin) })
  } catch (error) {
    console.error("Preferences error:", error)
    return serverError()
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}
