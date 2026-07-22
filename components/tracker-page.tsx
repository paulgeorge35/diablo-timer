import { Countdown } from "@/components/countdown"
import { DocumentTitle } from "@/components/document-title"
import NotificationsClient from "@/components/NotificationsClient"
import { JsonLd } from "@/components/seo/json-ld"
import { EVENTS, eventPath, getSanctuaryRowIds, type EventId } from "@/lib/events"
import { SITE_NAME, buildEventPageJsonLd, buildHomeJsonLd } from "@/lib/seo"

const WORLD_BOSS_SPAWN_INDICES = [1, 2, 3, 4, 5] as const

const SCHEDULE_DELAYS = [
  "animate-fade-rise-delay-2",
  "animate-fade-rise-delay-3",
  "animate-fade-rise-delay-4",
  "animate-fade-rise-delay-5",
  "animate-fade-rise-delay-6",
] as const

function heroBlurb(heroEventId: EventId): string {
  if (heroEventId === "world-boss") {
    return "World Boss every 3.5 hours — Legion, Helltide, and Realmwalker below. Enable alerts so you never miss the next hunt."
  }

  return `${EVENTS[heroEventId].name} countdown — World Boss and other Sanctuary events below. Enable alerts so you never miss the next hunt.`
}

type TrackerPageProps = {
  heroEventId: EventId
}

export function TrackerPage({ heroEventId }: TrackerPageProps) {
  const sanctuaryRows = getSanctuaryRowIds(heroEventId)
  const jsonLd =
    heroEventId === "world-boss" ? buildHomeJsonLd() : buildEventPageJsonLd(heroEventId)

  return (
    <div className="relative flex min-h-svh flex-col">
      <JsonLd data={jsonLd} />
      <DocumentTitle eventId={heroEventId} />
      <section className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="animate-fade-rise font-diablo-heavy mb-8 text-4xl tracking-wide text-pretty text-foreground sm:text-5xl md:text-6xl">
          {SITE_NAME}
        </h1>

        <div className="animate-fade-rise-delay-1 mb-8">
          <Countdown eventId={heroEventId} index={0} variant="hero" />
        </div>

        <p className="animate-fade-rise-delay-1 font-diablo-light mb-6 max-w-md text-sm text-muted-foreground">
          {heroBlurb(heroEventId)}
        </p>

        <div className="animate-fade-rise-delay-1">
          <NotificationsClient />
        </div>
      </section>

      <section className="mx-auto w-full max-w-lg px-6 pb-10">
        <h2 className="font-diablo-heavy mb-4 border-b border-border pb-2 text-center text-lg tracking-wide text-foreground/90">
          Sanctuary Events
        </h2>
        <div>
          {sanctuaryRows.map((eventId, index) => (
            <Countdown
              key={eventId}
              eventId={eventId}
              index={0}
              name={EVENTS[eventId].name}
              variant="row"
              href={eventPath(eventId)}
              className={SCHEDULE_DELAYS[index]}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-lg px-6 pb-12">
        <h2 className="font-diablo-heavy mb-4 border-b border-border pb-2 text-center text-lg tracking-wide text-foreground/90">
          Upcoming World Boss Spawns
        </h2>
        <div>
          {WORLD_BOSS_SPAWN_INDICES.map((spawnIndex, index) => (
            <Countdown
              key={`${spawnIndex}-world-boss`}
              eventId="world-boss"
              index={spawnIndex}
              variant="row"
              className={SCHEDULE_DELAYS[index]}
            />
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-border/50 px-6 py-6">
        <p className="font-diablo-light text-center text-sm text-muted-foreground">
          Made by{" "}
          <a
            href="https://paulgeorge.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="ease text-primary transition-colors duration-150 hover:text-primary/80"
          >
            Paul George
          </a>
        </p>
      </footer>
    </div>
  )
}
