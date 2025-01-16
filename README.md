# Diablo 4 - World Boss Countdown

This is a simple countdown timer for the World Boss events in Diablo 4. It uses a supabase postgres database to store the subscriptions and web-push to send push notifications to the registered devices.

I am using this in parallel with a Go server that keeps sending requests to the `/api/subscription/push` endpoint before the event to trigger the push notifications.

### Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or later)
- bun package manager (v1.1.0 or later)

### How to use

1. Clone the repository
2. Run `bun install`
3. Run `bun run dev:bun`
4. Open the app in your browser
5. Enable notifications

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License - see the LICENSE.md file for details.

### Contact

Paul George - contact@paulgeorge.dev

Project Link: https://github.com/paulgeorge35/diablo-timer
