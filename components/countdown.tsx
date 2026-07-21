"use client"

import Image from "next/image"

import { type EventId, eventIconUrl, worldBossImageUrl } from "@/lib/events"
import { useEventCountdown } from "@/lib/use-event-countdown"
import { useNotificationPrefs } from "@/lib/notification-prefs"

import { PulsatingDot } from "./pulsating-dot"

type CountdownVariant = "hero" | "row"

type CountdownProps = {
  eventId?: EventId
  index?: number
  name?: string
  variant?: CountdownVariant
  className?: string
}

function FixedWidthCountdown({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`inline-flex items-baseline ${className}`} aria-label={value}>
      {value.split("").map((char, index) =>
        /\d/.test(char) ? (
          <span key={index} className="inline-flex w-[0.9ch] justify-center">
            {char}
          </span>
        ) : (
          <span key={index}>{char}</span>
        ),
      )}
    </span>
  )
}

const BOSS_AVATAR_DISPLAY_PX = {
  row: 32,
  hero: 112,
} as const

function BossAvatar({
  src,
  alt,
  size,
  className = "",
  priority = false,
}: {
  src: string
  alt: string
  size: keyof typeof BOSS_AVATAR_DISPLAY_PX
  className?: string
  priority?: boolean
}) {
  const displayPx = BOSS_AVATAR_DISPLAY_PX[size]
  const requestPx = displayPx * 2
  const frameClass =
    size === "row"
      ? "size-8 shrink-0 rounded-full border border-primary/80 bg-secondary/40 p-px shadow-[0_0_12px_-4px_hsl(var(--primary)/0.45)]"
      : "mb-4 size-24 shrink-0 rounded-full border-2 border-primary/80 bg-secondary/40 p-1 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)] sm:size-28"

  return (
    <div className={`${frameClass} ${className}`}>
      <div className="size-full overflow-hidden rounded-full">
        <Image
          src={src}
          alt={alt}
          width={requestPx}
          height={requestPx}
          className="size-full object-cover object-center"
          priority={priority}
          unoptimized
        />
      </div>
    </div>
  )
}

export function Countdown({
  eventId = "world-boss",
  index = 0,
  name,
  variant = "hero",
  className = "",
}: CountdownProps) {
  const countdown = useEventCountdown(eventId, index)
  const notificationsEnabled = useNotificationPrefs(
    (s) => s.subscribed && s.eventIds.includes(eventId),
  )
  const displayName =
    name ?? (eventId === "world-boss" ? countdown.bossName : undefined) ?? countdown.name
  const bossImageUrl =
    eventId === "world-boss" && countdown.bossName
      ? worldBossImageUrl(
          countdown.bossName,
          variant === "hero" ? BOSS_AVATAR_DISPLAY_PX.hero : BOSS_AVATAR_DISPLAY_PX.row,
        )
      : undefined
  const timeClass = countdown.accent === "accent" ? "text-accent" : "text-primary"

  if (variant === "row") {
    return (
      <article
        className={`relative flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {bossImageUrl ? (
            <BossAvatar src={bossImageUrl} alt={countdown.bossName ?? ""} size="row" />
          ) : (
            <Image
              src={eventIconUrl(countdown.icon, 32)}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 opacity-80"
              unoptimized
            />
          )}
          <div className="min-w-0">
            <span className="font-diablo-light flex items-center text-sm text-foreground/90">
              {eventId !== "world-boss" && (
                <PulsatingDot tone="accent" className="mr-2" active={notificationsEnabled} />
              )}
              {displayName}
              {countdown.status === "active" ? (
                <span className="ml-2 text-xs text-accent">Active</span>
              ) : null}
            </span>
            <time
              dateTime={countdown.eventDateTime}
              className="font-diablo-light text-xs text-muted-foreground"
            >
              {countdown.eventTime}
            </time>
          </div>
        </div>
        <time
          dateTime={countdown.eventDateTime}
          className={`font-diablo-heavy shrink-0 text-lg sm:text-xl ${timeClass}`}
        >
          <FixedWidthCountdown value={countdown.timeLeft} />
        </time>
      </article>
    )
  }

  return (
    <article className={`flex flex-col items-center text-center ${className}`}>
      {bossImageUrl ? (
        <BossAvatar src={bossImageUrl} alt={countdown.bossName ?? ""} size="hero" priority />
      ) : (
        <Image
          src={eventIconUrl(countdown.icon, 80)}
          alt=""
          width={80}
          height={80}
          className="mb-4 size-16 object-contain opacity-90 sm:size-20"
          priority
          unoptimized
        />
      )}
      <p className="font-diablo-light mb-1 inline-flex items-center text-sm tracking-wide text-muted-foreground sm:text-base">
        {notificationsEnabled ? <PulsatingDot tone="accent" className="mr-2" /> : null}
        {displayName}
      </p>
      <time
        dateTime={countdown.eventDateTime}
        className={`font-diablo-heavy px-2 text-5xl tracking-wide sm:text-6xl md:text-7xl ${timeClass}`}
      >
        <FixedWidthCountdown value={countdown.timeLeft} />
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
