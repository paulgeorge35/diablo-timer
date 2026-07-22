import type { Metadata } from "next"
import localFont from "next/font/local"
import Image from "next/image"

import { BACKGROUND_IMAGE_ID, cdnImageUrl } from "@/lib/cdn"
import { createRootMetadata } from "@/lib/seo"

import { NotificationClickTracker } from "./components/notification-click-tracker"
import { OpenPanelAnalytics } from "./components/openpanel-analytics"

import "./globals.css"

const diabloHeavy = localFont({
  src: "./fonts/DiabloHeavy.ttf",
  variable: "--font-diablo-heavy",
})

const diabloLight = localFont({
  src: "./fonts/DiabloLight.ttf",
  variable: "--font-diablo-light",
})

export const metadata: Metadata = createRootMetadata()

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
        <OpenPanelAnalytics />
        <NotificationClickTracker />
        {children}
      </body>
    </html>
  )
}
