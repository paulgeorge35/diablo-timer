"use client"

import { type EventId, eventIconUrl, getEventCountdown } from "@/lib/events"
import { DateTime } from "luxon"
import Image from "next/image"
import { useEffect, useState } from "react"

type CountdownVariant = "hero" | "row"

type CountdownProps = {
  eventId?: EventId
  index?: number
  name?: string
  variant?: CountdownVariant
  className?: string
  /** Show current and following occurrence clock times (Sanctuary rows). */
  showNextOccurrence?: boolean
}

function useEventCountdown(eventId: EventId, index: number) {
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

export function Countdown({
  eventId = "world-boss",
  index = 0,
  name,
  variant = "hero",
  className = "",
  showNextOccurrence = false,
}: CountdownProps) {
  const countdown = useEventCountdown(eventId, index)
  const displayName = name ?? countdown.name
  const timeClass = countdown.accent === "accent" ? "text-accent" : "text-primary"

  if (variant === "row") {
    return (
      <article
        className={`flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={eventIconUrl(countdown.icon, 32)}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 opacity-80"
          />
          <div className="min-w-0">
            <p className="font-diablo-light truncate text-sm text-foreground/90">
              {displayName}
              {countdown.status === "active" ? (
                <span className="ml-2 text-xs text-accent">Active</span>
              ) : null}
            </p>
            {showNextOccurrence ? (
              <p className="font-diablo-light flex items-center gap-1.5 text-xs text-muted-foreground">
                <time dateTime={countdown.eventDateTime}>{countdown.eventTime}</time>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  →
                </span>
                <time dateTime={countdown.nextEventDateTime}>{countdown.nextEventTime}</time>
              </p>
            ) : (
              <time
                dateTime={countdown.eventDateTime}
                className="font-diablo-light text-xs text-muted-foreground"
              >
                {countdown.eventTime}
              </time>
            )}
          </div>
        </div>
        <time
          dateTime={countdown.eventDateTime}
          className={`font-diablo-heavy shrink-0 text-lg tabular-nums sm:text-xl ${timeClass}`}
        >
          {countdown.timeLeft}
        </time>
      </article>
    )
  }

  return (
    <article className={`flex flex-col items-center text-center ${className}`}>
      <Image
        src={eventIconUrl(countdown.icon, 80)}
        alt=""
        width={80}
        height={80}
        className="mb-4 size-16 opacity-90 sm:size-20"
        priority
      />
      <p className="font-diablo-light mb-1 text-sm tracking-wide text-muted-foreground sm:text-base">
        {displayName}
      </p>
      <time
        dateTime={countdown.eventDateTime}
        className={`font-diablo-heavy text-5xl tracking-wide tabular-nums sm:text-6xl md:text-7xl ${timeClass}`}
      >
        {countdown.timeLeft}
      </time>
      <p className="font-diablo-light mt-2 text-sm text-muted-foreground">
        {countdown.statusLabel}
      </p>
      <time
        dateTime={countdown.eventDateTime}
        className="font-diablo-light mt-1 text-base text-foreground/80"
      >
        {countdown.eventTime} local
      </time>
    </article>
  )
}
