import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Urbanist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { BeamsBackground } from "@/components/beams-background"
import { LoadingProvider } from "@/components/loading-provider"
import { Loading } from "@/components/loading"
import "./globals.css"

const urbanist = Urbanist({ 
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BSPrep - IITM BS Learning Platform",
  description: "A comprehensive learning platform for IITM BS students with Tamil courses, mentoring, and community support",
  generator: "v0.app",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={urbanist.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased ${urbanist.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <BeamsBackground />
          <div className="relative z-10">
            <LoadingProvider>
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>

            </LoadingProvider>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
