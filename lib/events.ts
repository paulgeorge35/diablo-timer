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

export type WorldBossEvent = "Avarice" | "Ashava" | "Azmodan" | "Wandering Death"

export const WORLD_BOSS_NAMES: readonly WorldBossEvent[] = [
  "Avarice",
  "Ashava",
  "Azmodan",
  "Wandering Death",
] as const

export const WORLD_BOSS_IMAGES: Map<WorldBossEvent, string> = new Map([
  ["Avarice", "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrv5xfpc000a01lkfv998ucm"],
  ["Ashava", "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrv5ui24000901lkua3py5ny"],
  ["Azmodan", "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrv626ii000001tf0g9dcko7"],
  [
    "Wandering Death",
    "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrv5xfpd000b01lkgmd5zshw",
  ],
])

/** Two of each boss in order: Avarice, Avarice, Ashava, Ashava, … */
export const WORLD_BOSS_ROTATION: readonly WorldBossEvent[] = WORLD_BOSS_NAMES.flatMap((name) => [
  name,
  name,
])

/** Baseline spawn (2025-01-16T10:00:00Z) was the second Avarice in the rotation. */
const WORLD_BOSS_BASELINE_ROTATION_INDEX = 1

export type WorldBossPrimaryZone = "Kehjistan" | "Fractured Peaks" | "Scosglen" | "Dry Steppes"

export type WorldBossSecondaryZone = "Nahantu" | "Skovos"

export type WorldBossZone = WorldBossPrimaryZone | WorldBossSecondaryZone

export const WORLD_BOSS_PRIMARY_ZONES: WorldBossPrimaryZone[] = [
  "Kehjistan",
  "Fractured Peaks",
  "Scosglen",
  "Dry Steppes",
]

export const WORLD_BOSS_SECONDARY_ZONES: WorldBossSecondaryZone[] = ["Nahantu", "Skovos"]

/** Primary zone for each spawn in order (verified against community trackers). */
export const WORLD_BOSS_ZONE_ROTATION: readonly WorldBossPrimaryZone[] = [
  "Kehjistan",
  "Fractured Peaks",
  "Kehjistan",
  "Scosglen",
  "Fractured Peaks",
  "Dry Steppes",
  "Scosglen",
  "Fractured Peaks",
]

/** Baseline spawn (2025-01-16T10:00:00Z) was in Fractured Peaks. */
const WORLD_BOSS_BASELINE_ZONE_ROTATION_INDEX = 1

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
    // :50 past the hour UTC cadence — every 25 minutes (:50, :15, :40, :05, …)
    baseline: "2026-07-20T21:50:00Z",
    intervalMs: 25 * 60 * 1000,
    kind: "interval",
  },
  realmwalker: {
    name: "Realmwalker",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchoq000501lk78mxsa11",
    // Same 25-minute cadence as Legion
    baseline: "2026-07-20T21:50:00Z",
    intervalMs: 25 * 60 * 1000,
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

export const ALL_EVENT_IDS = [
  "world-boss",
  "legion",
  "helltide",
  "realmwalker",
] as const satisfies readonly EventId[]

export const DEFAULT_NOTIFY_EVENT_IDS: EventId[] = ["world-boss"]

export function isEventId(value: unknown): value is EventId {
  return typeof value === "string" && (ALL_EVENT_IDS as readonly string[]).includes(value)
}

export function parseEventIds(value: unknown): EventId[] | null {
  if (!Array.isArray(value)) return null
  const ids = value.filter(isEventId)
  return ids.length > 0 ? [...new Set(ids)] : null
}

export function eventIconUrl(icon: string, size: number) {
  return `${icon}?w=${size}&h=${size}`
}

function intervalActiveMs(event: Extract<EventConfig, { kind: "interval" }>): number {
  return "activeMs" in event && typeof event.activeMs === "number" ? event.activeMs : 0
}

/** CDN resize for boss portraits — 2× display size for retina, served directly (not via Next image optimizer). */
export function worldBossImageUrl(boss: WorldBossEvent, displaySizePx: number) {
  const base = WORLD_BOSS_IMAGES.get(boss)
  if (!base) return ""
  const size = Math.ceil(displaySizePx * 2)
  return `${base}?w=${size}&q=90`
}

export function getWorldBossSpawnIndex(
  baselineIso: string,
  intervalMs: number,
  start: DateTime,
): number {
  const baseline = DateTime.fromISO(baselineIso, { zone: "utc" })
  return Math.round(start.diff(baseline).as("milliseconds") / intervalMs)
}

export function getWorldBossForSpawnIndex(spawnIndex: number): WorldBossEvent {
  const len = WORLD_BOSS_ROTATION.length
  const index = (((WORLD_BOSS_BASELINE_ROTATION_INDEX + spawnIndex) % len) + len) % len
  return WORLD_BOSS_ROTATION[index]!
}

export function getWorldBossAtStart(
  baselineIso: string,
  intervalMs: number,
  start: DateTime,
): WorldBossEvent {
  return getWorldBossForSpawnIndex(getWorldBossSpawnIndex(baselineIso, intervalMs, start))
}

export function getWorldBossZoneForSpawnIndex(spawnIndex: number): WorldBossPrimaryZone {
  const len = WORLD_BOSS_ZONE_ROTATION.length
  const index = (((WORLD_BOSS_BASELINE_ZONE_ROTATION_INDEX + spawnIndex) % len) + len) % len
  return WORLD_BOSS_ZONE_ROTATION[index]!
}

export function getWorldBossZoneAtStart(
  baselineIso: string,
  intervalMs: number,
  start: DateTime,
): WorldBossPrimaryZone {
  return getWorldBossZoneForSpawnIndex(getWorldBossSpawnIndex(baselineIso, intervalMs, start))
}

/** Next spawn/start that has not begun yet. */
export function getUpcomingStart(eventId: EventId, now: DateTime): DateTime {
  const event = EVENTS[eventId]

  if (event.kind === "helltide") {
    const current = getHelltideState(now, 0)
    return current.status === "upcoming" ? current.start : getHelltideState(now, 1).start
  }

  const activeMs = intervalActiveMs(event)
  const current = getIntervalState(event.baseline, event.intervalMs, now, 0, activeMs)
  return current.status === "upcoming"
    ? current.start
    : getIntervalState(event.baseline, event.intervalMs, now, 1, activeMs).start
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
  bossName?: WorldBossEvent
  zoneName?: WorldBossPrimaryZone
  timeLeft: string
  eventTime: string
  eventDateTime: string | undefined
  nextEventTime: string
  nextEventDateTime: string | undefined
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
      nextEventTime: "--:--",
      nextEventDateTime: undefined,
      statusLabel: "until start",
      accent,
      status: "upcoming",
    }
  }

  const activeMs = event.kind === "interval" ? intervalActiveMs(event) : 0
  const state =
    event.kind === "helltide"
      ? getHelltideState(now, index)
      : getIntervalState(event.baseline, event.intervalMs, now, index, activeMs)

  const nextState =
    event.kind === "helltide"
      ? getHelltideState(now, index + 1)
      : getIntervalState(event.baseline, event.intervalMs, now, index + 1, activeMs)

  const bossName =
    eventId === "world-boss" && event.kind === "interval"
      ? getWorldBossAtStart(event.baseline, event.intervalMs, state.start)
      : undefined

  const zoneName =
    eventId === "world-boss" && event.kind === "interval"
      ? getWorldBossZoneAtStart(event.baseline, event.intervalMs, state.start)
      : undefined

  return {
    name: event.name,
    icon: event.icon,
    bossName,
    zoneName,
    timeLeft: formatCountdown(now, state.target),
    eventTime: state.start.toLocal().toFormat("h:mma"),
    eventDateTime: state.start.toISO() ?? undefined,
    nextEventTime: nextState.start.toLocal().toFormat("h:mma"),
    nextEventDateTime: nextState.start.toISO() ?? undefined,
    statusLabel: state.label,
    accent,
    status: state.status,
  }
}
