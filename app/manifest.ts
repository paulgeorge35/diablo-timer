import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "World Boss Countdown",
		short_name: "World Boss Countdown",
		description: "Countdown to the next World Boss event",
		start_url: "/",
		display: "standalone",
    screenshots: [
      {
        form_factor: 'wide',
        platform: 'windows',
        src: '/screenshots/windows.jpeg',
        sizes: '1710x1149',
      },
      {
        form_factor: 'wide',
        platform: 'macos',
        src: '/screenshots/macos.jpeg',
        sizes: '1710x1149',
      },
      {
        form_factor: 'narrow',
        platform: 'ios',
        src: '/screenshots/ios.png',
        sizes: '426x928',
      },
      {
        form_factor: 'narrow',
        platform: 'android',
        src: '/screenshots/android.png',
        sizes: '426x928',
      }
    ],
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
