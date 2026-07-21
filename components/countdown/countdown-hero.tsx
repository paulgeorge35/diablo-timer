import Image from "next/image"

import { eventIconUrl } from "@/lib/events"
import { cn } from "@/lib/utils"

import { PulsatingDot } from "../pulsating-dot"
import { BossAvatar } from "./boss-avatar"
import { FixedWidthCountdown } from "./fixed-width-countdown"
import type { CountdownViewProps } from "./view"

export function CountdownHero({
  countdown,
  displayName,
  bossImageUrl,
  notificationsEnabled,
  className = "",
}: CountdownViewProps) {
  return (
    <article className={cn("flex flex-col items-center text-center", className)}>
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
        className={cn("font-diablo-heavy px-2 text-5xl tracking-wide sm:text-6xl md:text-7xl", {
          "text-accent": countdown.accent === "accent",
          "text-primary": countdown.accent !== "accent",
        })}
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
