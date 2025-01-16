"use client";

import { DateTime } from "luxon";
import Image from "next/image";
import { useEffect, useState } from "react";

const BASE_LINE_WORLD_EVENT = DateTime.fromISO("2025-01-16T10:00:00Z");
const WORLD_EVENT_INTERVAL = 1000 * 60 * 60 * 3.5; // 3.5 hours
// const WORLD_EVENT_DURATION = 1000 * 60 * 15; // 15 minutes

type CountdownProps = {
    index?: number;
    name: string;
};

export function Countdown({ index = 0, name }: CountdownProps) {
    const [now, setNow] = useState(DateTime.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(DateTime.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const msUntilBase = now.diff(BASE_LINE_WORLD_EVENT).milliseconds;
    const eventsUntilNow = Math.ceil(Math.abs(msUntilBase) / WORLD_EVENT_INTERVAL);
    const nextEvent = BASE_LINE_WORLD_EVENT.plus({ milliseconds: (eventsUntilNow + index) * WORLD_EVENT_INTERVAL });
    const timeLeft = nextEvent.diff(now, ['hours', 'minutes', 'seconds']).toFormat("h:mm:ss");

    return (
        <span className="flex flex-col items-center p-4 pt-8 bg-muted/20 relative">
            <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-background border">
                <Image src="/world-boss.png" alt="world boss" width={100} height={100} className="size-10" />
            </span>
            <span className="font-diablo-light">{name} - {nextEvent.toFormat("h:mma")}</span>
            <p className="text-3xl font-diablo-heavy">{timeLeft}</p>
            <p>until start</p>
        </span>
    )
}
