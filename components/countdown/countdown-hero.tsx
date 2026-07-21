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
  secondaryImageUrl,
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
      {countdown.zoneName ? (
        <p className="font-diablo-light mb-1 text-xs tracking-wide text-primary/80 sm:text-sm">
          {countdown.zoneName}
        </p>
      ) : null}
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
      {countdown.secondary ? (
        <div className="mt-4 flex items-center gap-3 border border-primary/30 bg-primary/5 px-4 py-2">
          {secondaryImageUrl ? (
            <BossAvatar src={secondaryImageUrl} alt={countdown.secondary.boss} size="row" />
          ) : null}
          <div className="text-left">
            <p className="font-diablo-light text-[0.65rem] tracking-wide text-muted-foreground uppercase">
              Also spawning
            </p>
            <p className="font-diablo-light text-sm text-foreground/90">
              {countdown.secondary.boss}
              <span className="text-primary/80"> · {countdown.secondary.zone}</span>
            </p>
          </div>
        </div>
      ) : null}
    </article>
  )
}
