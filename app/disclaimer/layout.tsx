import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: "BSPrep is an independent student initiative and is not affiliated with IIT Madras. Read what we do and do not guarantee.",
  path: "/disclaimer",
})

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
