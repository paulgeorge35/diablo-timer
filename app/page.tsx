import NotificationsClient from "@/components/NotificationsClient";
import { Countdown } from "@/components/countdown";

export default function Home() {
  return (
    <div className="p-8 pb-2 min-h-screen flex flex-col">
      <NotificationsClient />
      <h1 className="text-4xl font-diablo-heavy text-center mb-8">World Boss Countdown</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Countdown
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={`${index}-world-boss`}
            name={`${index === 0 ? "Upcoming" : "Next"} World Boss`}
            index={index}
          />
        ))}
      </div>
      <footer className="mt-auto">
        <p className="text-sm text-muted-foreground text-center">
          Made with ❤️ by <a href="https://paulgeorge.dev" target="_blank" rel="noopener noreferrer">Paul George</a>
        </p>
      </footer>
    </div>
  );
}
