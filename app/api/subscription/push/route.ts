import { env } from "@/env";
import { getAllSubscriptions } from "@/lib/db/subscriptions";
import { DateTime } from "luxon";
import { type NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { z } from "zod";

const BASE_LINE_WORLD_EVENT = DateTime.fromISO("2025-01-16T10:00:00Z");
const WORLD_EVENT_INTERVAL = 1000 * 60 * 60 * 3.5; // 3.5 hours

const vapidKeys = {
	publicKey: env.NEXT_PUBLIC_PUBLIC_KEY,
	privateKey: env.NEXT_PUBLIC_PRIVATE_KEY,
};

webpush.setVapidDetails(
	"https://diablo-timer.paulgeorge.dev/",
	vapidKeys.publicKey,
	vapidKeys.privateKey,
);

const subscriptionSchema = z.object({
	endpoint: z.string(),
	expirationTime: z.number().optional().nullable(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string(),
	}),
});

const Subscription = z.object({
	id: z.number(),
	subscription: z
		.string()
		.transform((s) => subscriptionSchema.parse(JSON.parse(s))),
});

export async function GET(_: NextRequest) {
	const subscriptions = getAllSubscriptions();

	const parsedSubscriptions = subscriptions.map((s) => Subscription.parse(s));

	const now = DateTime.now();
	const eventsUntilNow = Math.ceil(
		Math.abs(now.diff(BASE_LINE_WORLD_EVENT).milliseconds) /
			WORLD_EVENT_INTERVAL,
	);
	const nextEvent = BASE_LINE_WORLD_EVENT.plus({
		milliseconds: eventsUntilNow * WORLD_EVENT_INTERVAL,
	});
	const timeLeft = nextEvent.diff(now, 'minutes').minutes;
    
	if (timeLeft > env.NOTIFY_MINUTES_BEFORE_EVENT) {
		return NextResponse.json({
			message: `No events within ${env.NOTIFY_MINUTES_BEFORE_EVENT} minutes`,
		});
	}


	for (const s of parsedSubscriptions) {
		const payload = JSON.stringify({
			title: "World Boss Alert!",
			body: "A new World Boss event is starting in 10 minutes!",
		});
		webpush.sendNotification(s.subscription, payload);
	}

	return NextResponse.json({
		message: `${subscriptions.length} messages sent!`,
	});
}
