self.addEventListener("push", (event) => {
  if (!event.data) return

  event.waitUntil(
    (async () => {
      const eventData = await event.data.json()
      await self.registration.showNotification(eventData.title, {
        body: eventData.body,
        icon: "/icon-192x192.png",
        data: {
          eventId: eventData.eventId,
          bossName: eventData.bossName,
          url: eventData.url || self.location.origin,
        },
      })
    })(),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const eventId = typeof data.eventId === "string" ? data.eventId : undefined
  const bossName = typeof data.bossName === "string" ? data.bossName : undefined

  const target = new URL(data.url || self.location.origin)
  target.searchParams.set("ref", "push")
  if (eventId) target.searchParams.set("event_id", eventId)
  if (bossName) target.searchParams.set("boss", bossName)

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })

      for (const client of clientList) {
        if (!client.url.startsWith(self.location.origin) || !("focus" in client)) continue
        await client.focus()
        client.postMessage({
          type: "NOTIFICATION_CLICK",
          eventId,
          bossName,
        })
        return
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(target.href)
      }
    })(),
  )
})
