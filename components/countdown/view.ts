import type { EventCountdown, EventId } from "@/lib/events"

/** Resolved data shared by the row and hero countdown layouts. */
export type CountdownViewProps = {
  countdown: EventCountdown
  eventId: EventId
  displayName: string
  bossImageUrl?: string
  notificationsEnabled: boolean
  className?: string
}
