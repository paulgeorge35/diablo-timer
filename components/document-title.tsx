"use client"

import { useEffect } from "react"

import type { EventId } from "@/lib/events"
import { SITE_NAME } from "@/lib/seo"
import { useEventCountdown } from "@/lib/use-event-countdown"

type DocumentTitleProps = {
  eventId?: EventId
}

export function DocumentTitle({ eventId = "world-boss" }: DocumentTitleProps) {
  const countdown = useEventCountdown(eventId, 0)

  useEffect(() => {
    const parts = [countdown.timeLeft]

    if (countdown.bossName) {
      parts.push(countdown.bossName)
    }

    if (countdown.zoneName) {
      parts.push(countdown.zoneName)
    }

    document.title = parts.length > 1 ? `${parts.join(" · ")} | ${SITE_NAME}` : SITE_NAME

    return () => {
      document.title = SITE_NAME
    }
  }, [countdown.timeLeft, countdown.bossName, countdown.zoneName])

  return null
}
