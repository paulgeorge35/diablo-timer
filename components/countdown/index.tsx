"use client"

import { type EventId, worldBossImageUrl } from "@/lib/events"
import { useNotificationPrefs } from "@/lib/notification-prefs"
import { useEventCountdown } from "@/lib/use-event-countdown"

import { BOSS_AVATAR_DISPLAY_PX } from "./boss-avatar"
import { CountdownHero } from "./countdown-hero"
import { CountdownRow } from "./countdown-row"

type CountdownVariant = "hero" | "row"

type CountdownProps = {
  eventId?: EventId
  index?: number
  name?: string
  variant?: CountdownVariant
  className?: string
  href?: string
}

export function Countdown({
  eventId = "world-boss",
  index = 0,
  name,
  variant = "hero",
  className = "",
  href,
}: CountdownProps) {
  const countdown = useEventCountdown(eventId, index)
  const notificationsEnabled = useNotificationPrefs(
    (s) => s.subscribed && s.eventIds.includes(eventId),
  )

  const displayName =
    name ?? (eventId === "world-boss" ? countdown.bossName : undefined) ?? countdown.name

  const bossImageUrl =
    eventId === "world-boss" && countdown.bossName
      ? worldBossImageUrl(countdown.bossName, BOSS_AVATAR_DISPLAY_PX[variant])
      : undefined

  const secondaryImageUrl = countdown.secondary
    ? worldBossImageUrl(countdown.secondary.boss, BOSS_AVATAR_DISPLAY_PX.row)
    : undefined

  const viewProps = {
    countdown,
    eventId,
    displayName,
    bossImageUrl,
    secondaryImageUrl,
    notificationsEnabled,
    className,
    href,
  }

  return variant === "row" ? <CountdownRow {...viewProps} /> : <CountdownHero {...viewProps} />
}
