import { DateTime } from "luxon"

import { EVENTS, type EventConfig, type EventId } from "./config"

export type OccurrenceStatus = "active" | "upcoming"

export type OccurrenceState = {
  status: OccurrenceStatus
  /** Instant the countdown counts down to (end when active, start when upcoming). */
  target: DateTime
  /** Spawn/start time shown in the UI. */
  start: DateTime
  /** Integer index of this occurrence relative to the event baseline (drives rotations). */
  spawnIndex: number
  label: "remaining" | "until start"
}

function upcoming(baseline: DateTime, intervalMs: number, spawnIndex: number): OccurrenceState {
  const start = baseline.plus({ milliseconds: spawnIndex * intervalMs })
  return { status: "upcoming", target: start, start, spawnIndex, label: "until start" }
}

/**
 * Resolve the occurrence `index` steps ahead of `now` for a fixed-interval event.
 * While within `activeMs` of the current start, index 0 counts down the remaining active time;
 * every other index points at an upcoming start.
 */
export function getOccurrence(event: EventConfig, now: DateTime, index = 0): OccurrenceState {
  const baseline = DateTime.fromISO(event.baseline, { zone: "utc" })
  const activeMs = event.activeMs ?? 0
  const elapsed = now.diff(baseline).as("milliseconds")

  if (elapsed < 0) {
    return upcoming(baseline, event.intervalMs, index)
  }

  const currentIndex = Math.floor(elapsed / event.intervalMs)
  const msIntoCurrent = elapsed - currentIndex * event.intervalMs

  if (activeMs > 0 && msIntoCurrent < activeMs) {
    if (index === 0) {
      const start = baseline.plus({ milliseconds: currentIndex * event.intervalMs })
      return {
        status: "active",
        target: start.plus({ milliseconds: activeMs }),
        start,
        spawnIndex: currentIndex,
        label: "remaining",
      }
    }

    return upcoming(baseline, event.intervalMs, currentIndex + index)
  }

  return upcoming(baseline, event.intervalMs, currentIndex + 1 + index)
}

/** Next spawn/start that has not begun yet. */
export function getUpcomingStart(eventId: EventId, now: DateTime): DateTime {
  const event = EVENTS[eventId]
  const current = getOccurrence(event, now, 0)
  return current.status === "upcoming" ? current.start : getOccurrence(event, now, 1).start
}
