import { type NextRequest, NextResponse } from "next/server"

import { addSubscription, type PushSubscriptionJson } from "@/lib/db/subscriptions"
import { env } from "@/env"

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

    if (!isPushSubscription(data)) {
      return new NextResponse("Invalid subscription data", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    await addSubscription(data)

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST",
        },
      },
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
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
