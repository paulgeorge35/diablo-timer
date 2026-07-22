import { env } from "@/env"

export const SITE_NAME = "Diablo Sanctuary Tracker"

export const SITE_TAGLINE = "Never miss the next hunt."

/** Short description for meta tags, OG, and the web manifest. */
export const SITE_DESCRIPTION =
  "Countdown timers for Diablo 4 World Boss, Legion, Helltide, and Realmwalker — with optional push alerts."

/** Slightly punchier social copy. */
export const SITE_SOCIAL_DESCRIPTION =
  "Track World Boss, Legion, Helltide, and Realmwalker. Never miss the next hunt."

export const SITE_OG_ALT =
  "Diablo Sanctuary Tracker — World Boss, Legion, Helltide, and Realmwalker countdowns"

export const SITE_KEYWORDS = [
  "Diablo 4",
  "Diablo IV",
  "World Boss",
  "Ashava",
  "Avarice",
  "Azmodan",
  "Wandering Death",
  "Helltide",
  "Legion",
  "Realmwalker",
  "Sanctuary",
  "countdown",
  "tracker",
  "spawn timer",
] as const

/** Absolute site origin with no trailing slash. */
export function getSiteUrl(): string {
  return env.APP_URL.replace(/\/$/, "")
}
