import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { TrackerPage } from "@/components/tracker-page"
import { SANCTUARY_EVENT_IDS, isSanctuaryEventId } from "@/lib/events"
import { createEventMetadata } from "@/lib/seo"

type EventPageProps = {
  params: Promise<{ eventId: string }>
}

export function generateStaticParams() {
  return SANCTUARY_EVENT_IDS.map((eventId) => ({ eventId }))
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { eventId } = await params
  if (!isSanctuaryEventId(eventId)) {
    return {}
  }
  return createEventMetadata(eventId)
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params
  if (!isSanctuaryEventId(eventId)) {
    redirect("/")
  }

  return <TrackerPage heroEventId={eventId} />
}
