import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS Student Community",
  description: "Connect with fellow IITM BS students. Share resources, ask doubts and build your network in a Tamil-speaking student community.",
  path: "/community",
  keywords: ["IITM BS community", "IITM BS students", "IITM BS study groups", "IITM BS Tamil community"],
})

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
