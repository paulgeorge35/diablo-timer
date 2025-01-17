# Diablo Timer

> A Next.js-based web application that provides a countdown timer for Diablo 4 World Boss events and sends web push notifications to subscribed users.
> The application handles both the timer display and the subscription management for notifications.

A modern web application that helps Diablo 4 players track World Boss events with real-time countdown and push notifications.

## Features

- ⏱️ Real-time countdown timer for World Boss events
- 🔔 Web push notifications before events
- 💾 PostgreSQL database for subscription storage
- 🔐 Secure VAPID-based push notifications
- 🌐 Modern Next.js web interface

## Prerequisites

- Node.js v14 or higher
- Bun package manager v1.1.0 or higher
- PostgreSQL database
- VAPID keys for web push notifications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/paulgeorge35/diablo-timer
cd diablo-timer
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env` with your:
- Database URL
- VAPID keys

## Running the Application

Start the development server:
```bash
bun run dev:bun
```

The application will:
- Start the Next.js development server
- Connect to the PostgreSQL database
- Enable push notification subscriptions
- Display the countdown timer

## Architecture

The project consists of:
- Next.js frontend for the timer interface
- API routes for subscription management
- Integration with a separate Go service for notification dispatch
- PostgreSQL database for storing subscriptions

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Contact

Paul George - contact@paulgeorge.dev

Project Link: https://github.com/paulgeorge35/diablo-timer
