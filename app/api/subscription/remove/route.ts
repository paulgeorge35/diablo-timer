import { type NextRequest, NextResponse } from "next/server"

import { env } from "@/env"
import { deleteSubscriptionsByEndpoint } from "@/lib/db/subscriptions"

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
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
    const endpoint =
      data && typeof data === "object" && "endpoint" in data
        ? (data as { endpoint?: unknown }).endpoint
        : undefined

    if (typeof endpoint !== "string" || endpoint.length === 0) {
      return new NextResponse("Invalid endpoint", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    await deleteSubscriptionsByEndpoint(endpoint)

    return NextResponse.json({ success: true }, { headers: corsHeaders(allowedOrigin) })
  } catch (error) {
    console.error("Unsubscribe error:", error)
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
