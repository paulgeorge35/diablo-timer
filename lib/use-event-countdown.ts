"use client"

import { DateTime } from "luxon"
import { useEffect, useState } from "react"

import { type EventId, getEventCountdown } from "@/lib/events"

export function useEventCountdown(eventId: EventId, index = 0) {
  const [now, setNow] = useState<DateTime | null>(null)

  useEffect(() => {
    setNow(DateTime.now())
    const timer = setInterval(() => {
      setNow(DateTime.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return getEventCountdown(eventId, now, index)
}
