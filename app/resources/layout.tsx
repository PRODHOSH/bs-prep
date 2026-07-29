import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS Resources | Curated Notes & Study Materials",
  description: "Access a comprehensive collection of curated notes, reference materials, cheat sheets, and guides tailored specifically for the IIT Madras BS Degree curriculum.",
  keywords: ["IITM BS Notes", "BS Degree Study Materials", "IIT Madras BS resources", "Data Science cheat sheets", "IITM BS reference guides"],
  openGraph: {
    title: "IITM BS Study Resources & Notes | BSPrep",
    description: "Access a comprehensive collection of curated notes, reference materials, and guides tailored for the IIT Madras BS Degree.",
    url: "https://bsprep.in/resources",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IITM BS Resources & Study Material | BSPrep",
    description: "Access curated study notes and community-contributed materials for all IITM BS subjects.",
    images: ["/og-image.png"],
  },
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
