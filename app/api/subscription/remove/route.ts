import { type NextRequest, NextResponse } from "next/server"

import { trackSubscriptionRemoved } from "@/lib/analytics/server"
import {
  badRequest,
  corsHeaders,
  handleOptions,
  readEndpoint,
  requireSameOrigin,
  serverError,
} from "@/lib/api/http"
import { deleteSubscriptionsByEndpoint } from "@/lib/db/subscriptions"

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

    await deleteSubscriptionsByEndpoint(endpoint)
    trackSubscriptionRemoved()

    return NextResponse.json({ success: true }, { headers: corsHeaders(allowedOrigin) })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return serverError()
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}
