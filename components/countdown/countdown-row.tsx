import Image from "next/image"

import { eventIconUrl } from "@/lib/events"
import { cn } from "@/lib/utils"

import { PulsatingDot } from "../pulsating-dot"
import { BossAvatar } from "./boss-avatar"
import { FixedWidthCountdown } from "./fixed-width-countdown"
import type { CountdownViewProps } from "./view"

export function CountdownRow({
  countdown,
  eventId,
  displayName,
  bossImageUrl,
  notificationsEnabled,
  className = "",
}: CountdownViewProps) {
  return (
    <article
      className={cn(
        "relative flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0",
        className,
      )}
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
        className={cn("font-diablo-heavy shrink-0 text-lg sm:text-xl", {
          "text-accent": countdown.accent === "accent",
          "text-primary": countdown.accent !== "accent",
        })}
      >
        <FixedWidthCountdown value={countdown.timeLeft} />
      </time>
    </article>
  )
}
