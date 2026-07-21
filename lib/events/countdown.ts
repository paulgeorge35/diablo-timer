import { DateTime } from "luxon"

import {
  EVENTS,
  type EventId,
  type SecondaryBossSpawn,
  WORLD_BOSS_IMAGES,
  type WorldBossEvent,
  type WorldBossPrimaryZone,
} from "./config"
import { getOccurrence, type OccurrenceStatus } from "./schedule"
import { rotationAt } from "./world-boss"

export function eventIconUrl(icon: string, size: number) {
  return `${icon}?w=${size}&h=${size}`
}

/** CDN resize for boss portraits — 2× display size for retina, served directly (not via Next image optimizer). */
export function worldBossImageUrl(boss: WorldBossEvent, displaySizePx: number) {
  const base = WORLD_BOSS_IMAGES.get(boss)
  if (!base) return ""
  const size = Math.ceil(displaySizePx * 2)
  return `${base}?w=${size}&q=90`
}

function formatCountdown(now: DateTime, target: DateTime): string {
  return target.diff(now, ["hours", "minutes", "seconds"]).toFormat("h:mm:ss")
}

export type EventCountdown = {
  name: string
  icon: string
  bossName?: WorldBossEvent
  zoneName?: WorldBossPrimaryZone
  /** Additional boss spawning in an expansion zone during this occurrence, when any. */
  secondary?: SecondaryBossSpawn
  timeLeft: string
  eventTime: string
  eventDateTime: string | undefined
  nextEventTime: string
  nextEventDateTime: string | undefined
  statusLabel: string
  accent: "primary" | "accent"
  status: OccurrenceStatus
}

export function getEventCountdown(
  eventId: EventId,
  now: DateTime | null,
  index = 0,
): EventCountdown {
  const event = EVENTS[eventId]

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
      accent: event.accent,
      status: "upcoming",
    }
  }

  const state = getOccurrence(event, now, index)
  const nextState = getOccurrence(event, now, index + 1)

  const bossName = event.rotation ? rotationAt(event.rotation.boss, state.spawnIndex) : undefined
  const zoneName = event.rotation ? rotationAt(event.rotation.zone, state.spawnIndex) : undefined
  const secondary = event.rotation
    ? (rotationAt(event.rotation.secondary, state.spawnIndex) ?? undefined)
    : undefined

  return {
    name: event.name,
    icon: event.icon,
    bossName,
    zoneName,
    secondary,
    timeLeft: formatCountdown(now, state.target),
    eventTime: state.start.toLocal().toFormat("h:mma"),
    eventDateTime: state.start.toISO() ?? undefined,
    nextEventTime: nextState.start.toLocal().toFormat("h:mma"),
    nextEventDateTime: nextState.start.toISO() ?? undefined,
    statusLabel: state.label,
    accent: event.accent,
    status: state.status,
  }
}
