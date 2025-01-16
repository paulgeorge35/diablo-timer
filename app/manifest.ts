import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "World Boss Countdown",
		short_name: "World Boss Countdown",
		description: "Countdown to the next World Boss event",
		start_url: "https://diablo-timer.paulgeorge.dev",
		display: "standalone",
		icons: [
			{
				src: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
		],
	};
}
