import { DateTime } from "luxon"

export type EventId = "world-boss" | "legion" | "helltide" | "realmwalker"

type IntervalEvent = {
  name: string
  icon: string
  baseline: string
  intervalMs: number
  /** When set, show an active countdown for this long after each start. */
  activeMs?: number
  kind: "interval"
}

type HelltideEvent = {
  name: string
  icon: string
  intervalMs: number
  activeMs: number
  kind: "helltide"
}

export type EventConfig = IntervalEvent | HelltideEvent

export const EVENTS = {
  "world-boss": {
    name: "World Boss",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqeeh4000701lklzzcpdh7",
    baseline: "2025-01-16T10:00:00Z",
    intervalMs: 3.5 * 60 * 60 * 1000,
    kind: "interval",
  },
  legion: {
    name: "Legion",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchoo000401lk4n2ht3ml",
    // 00:35 local (UTC+3) / 21:35 UTC — every 25 minutes
    baseline: "2026-07-20T21:35:00Z",
    intervalMs: 25 * 60 * 1000,
    activeMs: 4 * 60 * 1000,
    kind: "interval",
  },
  realmwalker: {
    name: "Realmwalker",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchoq000501lk78mxsa11",
    baseline: "2026-07-20T21:50:00Z",
    intervalMs: 20 * 60 * 1000,
    kind: "interval",
  },
  helltide: {
    name: "Helltide",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchor000601lkhrhogly8",
    intervalMs: 60 * 60 * 1000,
    activeMs: 55 * 60 * 1000,
    kind: "helltide",
  },
} as const satisfies Record<EventId, EventConfig>

export const SANCTUARY_EVENT_IDS = ["legion", "helltide", "realmwalker"] as const

export function eventIconUrl(icon: string, size: number) {
  return `${icon}?w=${size}&h=${size}`
}

export type OccurrenceStatus = "active" | "upcoming"

export type OccurrenceState = {
  status: OccurrenceStatus
  /** Instant the countdown counts down to (end when active, start when upcoming). */
  target: DateTime
  /** Spawn/start time shown in the UI. */
  start: DateTime
  label: "remaining" | "until start"
}

/** Next start at or after `now` for a fixed interval schedule (no active window). */
export function getNextOccurrence(
  baselineIso: string,
  intervalMs: number,
  now: DateTime,
  index = 0,
): DateTime {
  const baseline = DateTime.fromISO(baselineIso, { zone: "utc" })
  const elapsed = now.diff(baseline).as("milliseconds")

  if (elapsed <= 0) {
    return baseline.plus({ milliseconds: index * intervalMs })
  }

  const steps = Math.ceil(elapsed / intervalMs)
  return baseline.plus({ milliseconds: (steps + index) * intervalMs })
}

/**
 * Interval event with optional active window.
 * While within `activeMs` of the current start, index 0 counts down the remaining active time.
 */
export function getIntervalState(
  baselineIso: string,
  intervalMs: number,
  now: DateTime,
  index = 0,
  activeMs = 0,
): OccurrenceState {
  const baseline = DateTime.fromISO(baselineIso, { zone: "utc" })
  const elapsed = now.diff(baseline).as("milliseconds")

  if (elapsed < 0) {
    const start = baseline.plus({ milliseconds: index * intervalMs })
    return {
      status: "upcoming",
      target: start,
      start,
      label: "until start",
    }
  }

  const currentIndex = Math.floor(elapsed / intervalMs)
  const currentStart = baseline.plus({ milliseconds: currentIndex * intervalMs })
  const msIntoCurrent = elapsed - currentIndex * intervalMs

  if (activeMs > 0 && msIntoCurrent < activeMs) {
    if (index === 0) {
      return {
        status: "active",
        target: currentStart.plus({ milliseconds: activeMs }),
        start: currentStart,
        label: "remaining",
      }
    }

    const start = currentStart.plus({ milliseconds: index * intervalMs })
    return {
      status: "upcoming",
      target: start,
      start,
      label: "until start",
    }
  }

  const nextStart = currentStart.plus({ milliseconds: intervalMs })
  const start = nextStart.plus({ milliseconds: index * intervalMs })
  return {
    status: "upcoming",
    target: start,
    start,
    label: "until start",
  }
}

export function getHelltideState(now: DateTime, index = 0): OccurrenceState {
  const { intervalMs, activeMs } = EVENTS.helltide
  const hourStart = now.toUTC().startOf("hour")
  const msIntoHour = now.toUTC().diff(hourStart).as("milliseconds")

  if (msIntoHour < activeMs) {
    if (index === 0) {
      return {
        status: "active",
        target: hourStart.plus({ milliseconds: activeMs }),
        start: hourStart,
        label: "remaining",
      }
    }

    const start = hourStart.plus({ hours: index })
    return {
      status: "upcoming",
      target: start,
      start,
      label: "until start",
    }
  }

  const nextStart = hourStart.plus({ milliseconds: intervalMs })
  const start = nextStart.plus({ hours: index })
  return {
    status: "upcoming",
    target: start,
    start,
    label: "until start",
  }
}

export type EventCountdown = {
  name: string
  icon: string
  timeLeft: string
  eventTime: string
  eventDateTime: string | undefined
  statusLabel: string
  accent: "primary" | "accent"
  status: OccurrenceStatus
}

function formatCountdown(now: DateTime, target: DateTime): string {
  return target.diff(now, ["hours", "minutes", "seconds"]).toFormat("h:mm:ss")
}

export function getEventCountdown(
  eventId: EventId,
  now: DateTime | null,
  index = 0,
): EventCountdown {
  const event = EVENTS[eventId]
  const accent = eventId === "helltide" ? "accent" : "primary"

  if (!now) {
    return {
      name: event.name,
      icon: event.icon,
      timeLeft: "--:--:--",
      eventTime: "--:--",
      eventDateTime: undefined,
      statusLabel: "until start",
      accent,
      status: "upcoming",
    }
  }

  const state =
    event.kind === "helltide"
      ? getHelltideState(now, index)
      : getIntervalState(
          event.baseline,
          event.intervalMs,
          now,
          index,
          "activeMs" in event ? (event.activeMs ?? 0) : 0,
        )

  return {
    name: event.name,
    icon: event.icon,
    timeLeft: formatCountdown(now, state.target),
    eventTime: state.start.toLocal().toFormat("h:mma"),
    eventDateTime: state.start.toISO() ?? undefined,
    statusLabel: state.label,
    accent,
    status: state.status,
  }
}
