import { DateTime } from "luxon"

import {
  EVENTS,
  type EventId,
  type RotationTable,
  type WorldBossEvent,
  type WorldBossPrimaryZone,
} from "./config"

/** Value at `spawnIndex` in a cyclic rotation table (handles negative indices). */
export function rotationAt<T>(table: RotationTable<T>, spawnIndex: number): T {
  const len = table.values.length
  const index = (((table.baselineIndex + spawnIndex) % len) + len) % len
  return table.values[index]!
}

export function worldBossForSpawnIndex(spawnIndex: number): WorldBossEvent | undefined {
  const rotation = EVENTS["world-boss"].rotation
  return rotation ? rotationAt(rotation.boss, spawnIndex) : undefined
}

export function worldBossZoneForSpawnIndex(spawnIndex: number): WorldBossPrimaryZone | undefined {
  const rotation = EVENTS["world-boss"].rotation
  return rotation ? rotationAt(rotation.zone, spawnIndex) : undefined
}

function spawnIndexAtStart(eventId: EventId, start: DateTime): number {
  const event = EVENTS[eventId]
  const baseline = DateTime.fromISO(event.baseline, { zone: "utc" })
  return Math.round(start.diff(baseline).as("milliseconds") / event.intervalMs)
}

/** Boss spawning at a given start time, or `undefined` for events without a boss rotation. */
export function bossAtStart(eventId: EventId, start: DateTime): WorldBossEvent | undefined {
  const rotation = EVENTS[eventId].rotation
  return rotation ? rotationAt(rotation.boss, spawnIndexAtStart(eventId, start)) : undefined
}
