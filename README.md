# Diablo Timer

A Next.js app that tracks Diablo 4 World Boss (and Sanctuary) event countdowns and sends web push notifications before World Boss spawns.

## Features

- Real-time countdown for World Boss, Legion, Helltide, and Realmwalker
- Web push notifications before World Boss events
- PostgreSQL subscription storage via Prisma
- Vercel Cron dispatch (every minute) with VAPID push

## Prerequisites

- Bun package manager
- PostgreSQL database
- VAPID keys for web push
- Vercel Pro (or equivalent) for every-minute cron schedules

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
- `CRON_SECRET` — bearer token for `/api/cron/notify`
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

To exercise the cron route locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify
```

## Architecture

- Next.js App Router UI and API routes
- Prisma ORM + Postgres for `subscriptions` and `notification_dispatches`
- [`/api/cron/notify`](app/api/cron/notify/route.ts) — Vercel Cron every minute; notifies once per World Boss spawn inside the lead-time window
- [`/api/subscription/save`](app/api/subscription/save/route.ts) — stores browser push subscriptions
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
