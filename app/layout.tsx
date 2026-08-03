import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import Script from "next/script"
import { Sora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { BeamsBackgroundLazy } from "@/components/beams-background-lazy"
import { LoadingProvider } from "@/components/loading-provider"
import { Loading } from "@/components/loading"
import { AuthErrorHandler } from "@/components/auth-error-handler"
import { ReferralTracker } from "@/components/referral-tracker"
import { TourProvider } from "@/components/tour-provider"
import { CookieBanner } from "@/components/cookie-banner"
import "./globals.css"

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in"
const siteName = "BSPrep"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BSPrep | Premium IITM BS Tamil Courses, GPA Tools & Notes",
    template: "%s | BSPrep",
  },
  description: "Accelerate your IIT Madras BS Degree journey with BSPrep. Master concepts through premium Tamil medium video courses, live doubt solving, advanced GPA calculators, curated notes, interactive quizzes, and a thriving student community.",
  keywords: [
    "IITM BS",
    "IITM BS Degree",
    "IIT Madras BS Degree",
    "BS Data Science",
    "Tamil Medium Courses IITM BS",
    "IITM BS Video Lectures",
    "IITM BS Qualifier Prep",
    "IITM BS Foundation Courses",
    "GPA calculator",
    "GPA Predictor IITM",
    "IITM BS notes",
    "IITM BS community",
    "online degree prep",
    "BSPrep",
    "IITM BS Quiz Prep",
    "IITM BS Study Material",
    "IITM BS Assignments",
    "Learn Programming Tamil"
  ],
  authors: [{ name: "BSPrep Team", url: siteUrl }],
  creator: "BSPrep",
  publisher: "BSPrep",
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "BSPrep | Premium IITM BS Tamil Courses & Tools",
    description: "Accelerate your IIT Madras BS Degree journey with BSPrep. Master concepts through premium Tamil medium video courses, advanced GPA calculators, curated notes, and interactive quizzes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BSPrep - The Ultimate IITM BS Student Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BSPrep | Premium IITM BS Tamil Courses & Tools",
    description: "Accelerate your IIT Madras BS Degree journey with BSPrep. Master concepts through premium Tamil medium video courses, advanced GPA calculators, and notes.",
    images: ["/og-image.png"],
    creator: "@bsprep",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "5ODn-khJLlBmRAPlBkHz4w54nYhejaoLbrkwl_1-_NU",
  },
  icons: {
    icon: "/new-logo-favicon.png",
    apple: "/new-logo-favicon.png",
  },
  category: "education",
  other: {
    thumbnail: `${siteUrl}/og-image.png`,
    image: `${siteUrl}/og-image.png`
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-06EFDQ4LSM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-06EFDQ4LSM');
          `}
        </Script>
        <Script id="seo-organization-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/new-logo.jpeg`,
            image: `${siteUrl}/og-image.png`,
            description: "Student-led platform for IIT Madras BS Degree Qualifier preparation. Not affiliated with IIT Madras.",
            sameAs: [
              "https://www.linkedin.com/company/bs-prep/",
              "https://www.youtube.com/@DataScienceIITMTamil",
            ],
          })}
        </Script>
        <Script id="seo-website-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: siteUrl,
            image: `${siteUrl}/og-image.png`,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/resources?search={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
        {/* Cloudflare Turnstile */}
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        {/* Better Stack Announcement Widget — production only to avoid localhost 404s */}
        {process.env.NODE_ENV === "production" && (
          <Script
            src="https://uptime.betterstack.com/widgets/announcement.js"
            data-id="255506"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`font-sans antialiased ${sora.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ReferralTracker />
          <BeamsBackgroundLazy />
          <div className="relative z-10">
            <AuthErrorHandler />
            <TourProvider />
            <LoadingProvider>
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </LoadingProvider>
          </div>
          <CookieBanner />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
