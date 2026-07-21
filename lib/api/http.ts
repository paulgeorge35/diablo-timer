import { type NextRequest, NextResponse } from "next/server"

import { env } from "@/env"

export function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

/**
 * Verify the request originates from the app itself.
 * Returns the allowed origin on success, or a 401 response to return directly.
 */
export function requireSameOrigin(request: NextRequest): { allowedOrigin: string } | NextResponse {
  const origin = request.headers.get("origin")
  const allowedOrigin = env.APP_URL

  if (!origin || origin !== allowedOrigin) {
    return new NextResponse("Unauthorized", { status: 401, statusText: "Unauthorized" })
  }

  return { allowedOrigin }
}

/** Extract a non-empty `endpoint` string from a parsed request body, or `null`. */
export function readEndpoint(data: unknown): string | null {
  const endpoint =
    data && typeof data === "object" && "endpoint" in data
      ? (data as { endpoint?: unknown }).endpoint
      : undefined
  return typeof endpoint === "string" && endpoint.length > 0 ? endpoint : null
}

export function badRequest(message: string) {
  return new NextResponse(message, { status: 400, statusText: "Bad Request" })
}

export function serverError() {
  return new NextResponse("Internal Server Error", {
    status: 500,
    statusText: "Internal Server Error",
  })
}

/** Shared CORS preflight handler used by every subscription route. */
export function handleOptions(request: NextRequest) {
  const origin = request.headers.get("origin")
  const allowedOrigin = env.APP_URL

  if (!origin || origin !== allowedOrigin) {
    return new NextResponse(null, { status: 204 })
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders(allowedOrigin) })
}
