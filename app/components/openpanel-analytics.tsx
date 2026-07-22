"use client"

import dynamic from "next/dynamic"

import { env } from "@/env"

const OpenPanelComponent = dynamic(
  () => import("@openpanel/nextjs").then((mod) => mod.OpenPanelComponent),
  { ssr: false },
)

/** Self-hosted: script at API origin. Cloud: omit and use package default (openpanel.dev/op1.js). */
function getOpenPanelScriptUrl(apiUrl: string): string | undefined {
  const origin = new URL(apiUrl).origin
  if (origin === "https://api.openpanel.dev") return undefined
  return `${origin}/op1.js`
}

export function OpenPanelAnalytics() {
  const clientId = env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
  const apiUrl = env.NEXT_PUBLIC_OPENPANEL_API_URL
  if (!clientId || !apiUrl) return null

  const scriptUrl = getOpenPanelScriptUrl(apiUrl)

  return (
    <OpenPanelComponent
      clientId={clientId}
      apiUrl={apiUrl}
      {...(scriptUrl ? { scriptUrl } : {})}
      trackScreenViews={true}
      trackAttributes={true}
      trackHashChanges={true}
      trackOutgoingLinks={true}
      strategy="afterInteractive"
    />
  )
}
