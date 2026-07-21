"use client"

import { create } from "zustand"

import type { EventId } from "@/lib/events"

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
