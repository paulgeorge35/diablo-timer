import type { MetadataRoute } from "next"

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    screenshots: [
      {
        form_factor: "wide",
        platform: "windows",
        src: "/screenshots/windows.jpeg",
        sizes: "1710x1149",
      },
      {
        form_factor: "wide",
        platform: "macos",
        src: "/screenshots/macos.jpeg",
        sizes: "1710x1149",
      },
      {
        form_factor: "narrow",
        platform: "ios",
        src: "/screenshots/ios.png",
        sizes: "426x928",
      },
      {
        form_factor: "narrow",
        platform: "android",
        src: "/screenshots/android.png",
        sizes: "426x928",
      },
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
  }
}
