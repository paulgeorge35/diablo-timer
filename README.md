# Diablo Timer

A Next.js app that tracks Diablo 4 World Boss (and Sanctuary) event countdowns and sends web push notifications before World Boss spawns.

## Features

- Real-time countdown for World Boss, Legion, Helltide, and Realmwalker
- Web push notifications before World Boss events
- PostgreSQL subscription storage via Prisma
- External webhook dispatch with VAPID push

## Prerequisites

- Bun package manager
- PostgreSQL database
- VAPID keys for web push
- An external scheduler (cron, Coolify, etc.) that can HTTP-call the notify webhook about once a minute

## Installation

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/paulgeorge35/diablo-timer
cd diablo-timer
bun install
```

2. Copy env template and fill in values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_PUBLIC_KEY` / `PRIVATE_KEY` — VAPID key pair
- `VAPID_SUBJECT` — contact URI for VAPID (e.g. `mailto:you@example.com`)
- `WEBHOOK_SECRET` — bearer token for `/api/webhook/notify`
- `NOTIFY_MINUTES_BEFORE_EVENT` — lead time before World Boss (default `10`)
- `APP_URL` / `NEXT_PUBLIC_APP_URL` — app origin

3. Apply database migrations to your remote Postgres:

```bash
bun run db:deploy
```

## Running locally

```bash
bun run dev
```

Trigger the notify webhook:

```bash
curl -X POST -H "Authorization: Bearer $WEBHOOK_SECRET" http://localhost:3000/api/webhook/notify
```

## External scheduler

Point your service at production every minute (or every few minutes):

```bash
curl -X POST -H "Authorization: Bearer $WEBHOOK_SECRET" https://YOUR_DOMAIN/api/webhook/notify
```

The handler only sends inside the lead-time window and dedupes per World Boss spawn, so frequent polls are safe.

## Architecture

- Next.js App Router UI and API routes
- Prisma ORM + Postgres for `subscriptions` and `notification_dispatches`
- [`/api/webhook/notify`](app/api/webhook/notify/route.ts) — GET/POST webhook; notifies once per event spawn inside the lead-time window for each selected event
- [`/api/subscription/save`](app/api/subscription/save/route.ts) — stores browser push subscriptions + event preferences
- [`/api/subscription/preferences`](app/api/subscription/preferences/route.ts) — read/update which events to notify for
- [`/api/subscription/remove`](app/api/subscription/remove/route.ts) — removes a push subscription
- Service worker [`public/service.js`](public/service.js) displays push payloads

## Database scripts

| Script | Purpose |
|--------|---------|
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Create/apply migrations in development |
| `bun run db:deploy` | Apply migrations (`prisma migrate deploy`) |

## License

This project is licensed under the MIT License — see LICENSE.md for details.

## Contact

Paul George — contact@paulgeorge.dev

Project Link: https://github.com/paulgeorge35/diablo-timer
