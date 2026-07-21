"use client"

import { create } from "zustand"

import { ALL_EVENT_IDS, DEFAULT_NOTIFY_EVENT_IDS, type EventId } from "@/lib/events"

type NotificationPrefsState = {
  subscribed: boolean
  eventIds: EventId[]
  setPreferences: (eventIds: EventId[]) => void
  clearPreferences: () => void
}

export const useNotificationPrefs = create<NotificationPrefsState>((set) => ({
  subscribed: false,
  eventIds: [],
  setPreferences: (eventIds) => set({ subscribed: true, eventIds }),
  clearPreferences: () => set({ subscribed: false, eventIds: [] }),
}))

export function parsePreferencePayload(data: unknown): EventId[] {
  if (
    data &&
    typeof data === "object" &&
    "eventIds" in data &&
    Array.isArray((data as { eventIds: unknown }).eventIds)
  ) {
    const ids = (data as { eventIds: unknown[] }).eventIds.filter(
      (id): id is EventId =>
        typeof id === "string" && (ALL_EVENT_IDS as readonly string[]).includes(id),
    )
    return ids.length > 0 ? ids : DEFAULT_NOTIFY_EVENT_IDS
  }
  return DEFAULT_NOTIFY_EVENT_IDS
}
