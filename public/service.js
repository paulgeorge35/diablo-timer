self.addEventListener("push", async (event) => {
  if (!event.data) return

  const eventData = await event.data.json()
  event.waitUntil(
    self.registration.showNotification(eventData.title, {
      body: eventData.body,
      icon: "/icon-192x192.png",
    }),
  )
})
