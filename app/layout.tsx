import type { Metadata } from "next"
import localFont from "next/font/local"
import Image from "next/image"

import { BACKGROUND_IMAGE_ID, cdnImageUrl } from "@/lib/cdn"

import "./globals.css"

const diabloHeavy = localFont({
  src: "./fonts/DiabloHeavy.ttf",
  variable: "--font-diablo-heavy",
})

const diabloLight = localFont({
  src: "./fonts/DiabloLight.ttf",
  variable: "--font-diablo-light",
})

export const metadata: Metadata = {
  title: "Diablo Sanctuary Tracker",
  description:
    "Countdown timers for Diablo 4 World Boss, Legion, Helltide, and Realmwalker — with optional push alerts.",
  openGraph: {
    title: "Diablo Sanctuary Tracker",
    description: "Track World Boss, Legion, Helltide, and Realmwalker. Never miss the next hunt.",
    type: "website",
    siteName: "Diablo Sanctuary Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diablo Sanctuary Tracker",
    description: "Track World Boss, Legion, Helltide, and Realmwalker. Never miss the next hunt.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${diabloHeavy.variable} ${diabloLight.variable} dark relative min-h-svh antialiased`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <Image
            src={cdnImageUrl(BACKGROUND_IMAGE_ID)}
            alt="Diablo IV Background"
            fill
            priority
            className="object-cover object-center opacity-25"
            unoptimized
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/55 to-background/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.75)_100%)]" />
        </div>
        {children}
      </body>
    </html>
  )
}
