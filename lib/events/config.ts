export type EventId = "world-boss" | "legion" | "helltide" | "realmwalker"

export type WorldBossEvent = "Avarice" | "Ashava" | "Azmodan" | "Wandering Death"

export type WorldBossPrimaryZone = "Kehjistan" | "Fractured Peaks" | "Scosglen" | "Dry Steppes"

/** Expansion (Vessel of Hatred) zones where secondary bosses appear. */
export type WorldBossSecondaryZone = "Nahantu" | "Skovos"

export type WorldBossZone = WorldBossPrimaryZone | WorldBossSecondaryZone

/** An additional boss that spawns in an expansion zone alongside the main rotation. */
export type SecondaryBossSpawn = {
  boss: WorldBossEvent
  zone: WorldBossSecondaryZone
}

/** A cyclic lookup table: `values` repeats forever, offset so `baselineIndex` aligns with spawn 0. */
export type RotationTable<T> = {
  values: readonly T[]
  baselineIndex: number
}

/** Optional per-event rotations (currently only the World Boss rotates boss + zone). */
export type EventRotation = {
  boss: RotationTable<WorldBossEvent>
  zone: RotationTable<WorldBossPrimaryZone>
  /** Secondary expansion-zone boss per spawn, or `null` when none spawns. */
  secondary: RotationTable<SecondaryBossSpawn | null>
}

/**
 * Every event is a fixed-interval schedule.
 * `activeMs` marks how long an occurrence stays "active" after it starts (0 = instantaneous).
 * `rotation` is set only for events whose occurrence cycles through bosses/zones.
 */
export type EventConfig = {
  name: string
  icon: string
  baseline: string
  intervalMs: number
  activeMs?: number
  accent: "primary" | "accent"
  rotation?: EventRotation
}

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
const WORLD_BOSS_ROTATION: readonly WorldBossEvent[] = WORLD_BOSS_NAMES.flatMap((name) => [
  name,
  name,
])

/** Primary zone for each spawn in order (verified against community trackers). */
const WORLD_BOSS_ZONE_ROTATION: readonly WorldBossPrimaryZone[] = [
  "Kehjistan",
  "Fractured Peaks",
  "Kehjistan",
  "Scosglen",
  "Fractured Peaks",
  "Dry Steppes",
  "Scosglen",
  "Fractured Peaks",
]

/**
 * Secondary boss per spawn, aligned to the same rotation as the primary boss/zone.
 * Only two spawns have one: the second Ashava (Avarice in Skovos) and the second
 * Wandering Death (Avarice in Nahantu).
 */
const WORLD_BOSS_SECONDARY_ROTATION: readonly (SecondaryBossSpawn | null)[] = [
  null, // Avarice — Kehjistan
  null, // Avarice — Fractured Peaks
  null, // Ashava — Kehjistan
  { boss: "Avarice", zone: "Skovos" }, // Ashava — Scosglen
  null, // Azmodan — Fractured Peaks
  null, // Azmodan — Dry Steppes
  null, // Wandering Death — Scosglen
  { boss: "Avarice", zone: "Nahantu" }, // Wandering Death — Fractured Peaks
]

/** Baseline spawn (2025-01-16T10:00:00Z) was the second Avarice and was in Fractured Peaks. */
const WORLD_BOSS_ROTATION_TABLE: RotationTable<WorldBossEvent> = {
  values: WORLD_BOSS_ROTATION,
  baselineIndex: 1,
}

const WORLD_BOSS_ZONE_TABLE: RotationTable<WorldBossPrimaryZone> = {
  values: WORLD_BOSS_ZONE_ROTATION,
  baselineIndex: 1,
}

const WORLD_BOSS_SECONDARY_TABLE: RotationTable<SecondaryBossSpawn | null> = {
  values: WORLD_BOSS_SECONDARY_ROTATION,
  baselineIndex: 1,
}

export const EVENTS: Record<EventId, EventConfig> = {
  "world-boss": {
    name: "World Boss",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqeeh4000701lklzzcpdh7",
    baseline: "2025-01-16T10:00:00Z",
    intervalMs: 3.5 * 60 * 60 * 1000,
    accent: "primary",
    rotation: {
      boss: WORLD_BOSS_ROTATION_TABLE,
      zone: WORLD_BOSS_ZONE_TABLE,
      secondary: WORLD_BOSS_SECONDARY_TABLE,
    },
  },
  legion: {
    name: "Legion",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchoo000401lk4n2ht3ml",
    // :50 past the hour UTC cadence — every 25 minutes (:50, :15, :40, :05, …)
    baseline: "2026-07-20T21:50:00Z",
    intervalMs: 25 * 60 * 1000,
    accent: "primary",
  },
  realmwalker: {
    name: "Realmwalker",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchoq000501lk78mxsa11",
    // Same 25-minute cadence as Legion
    baseline: "2026-07-20T21:50:00Z",
    intervalMs: 25 * 60 * 1000,
    accent: "primary",
  },
  helltide: {
    name: "Helltide",
    icon: "https://cdn.paulgeorge.dev/p/cmrtphyvt000001lkv0pb5d2m/cmrtqchor000601lkhrhogly8",
    // Aligned to the top of every UTC hour; baseline is any hour boundary.
    baseline: "2024-01-01T00:00:00Z",
    intervalMs: 60 * 60 * 1000,
    activeMs: 55 * 60 * 1000,
    accent: "accent",
  },
}

export const SANCTUARY_EVENT_IDS = ["legion", "helltide", "realmwalker"] as const

export const ALL_EVENT_IDS = [
  "world-boss",
  "legion",
  "helltide",
  "realmwalker",
] as const satisfies readonly EventId[]

export const DEFAULT_NOTIFY_EVENT_IDS: EventId[] = ["world-boss"]
