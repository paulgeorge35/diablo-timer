import type { Metadata } from "next"

import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SOCIAL_DESCRIPTION,
  getSiteUrl,
} from "./site"

export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl()

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    applicationName: SITE_NAME,
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: SITE_NAME,
      description: SITE_SOCIAL_DESCRIPTION,
      type: "website",
      siteName: SITE_NAME,
      url: "/",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_SOCIAL_DESCRIPTION,
    },
  }
}
