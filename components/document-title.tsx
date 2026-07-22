"use client"

import { useEffect } from "react"

import { useEventCountdown } from "@/lib/use-event-countdown"

const BASE_TITLE = "Diablo Sanctuary Tracker"

export function DocumentTitle() {
  const countdown = useEventCountdown("world-boss", 0)

  useEffect(() => {
    const parts = [countdown.timeLeft]

    if (countdown.bossName) {
      parts.push(countdown.bossName)
    }

    if (countdown.zoneName) {
      parts.push(countdown.zoneName)
    }

    document.title = parts.length > 1 ? `${parts.join(" · ")} | ${BASE_TITLE}` : BASE_TITLE

    return () => {
      document.title = BASE_TITLE
    }
  }, [countdown.timeLeft, countdown.bossName, countdown.zoneName])

  return null
}
