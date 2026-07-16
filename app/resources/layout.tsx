import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS Resources | Notes & Study Material",
  description: "Access curated study notes, resources, and community-contributed materials for all IITM BS subjects. Filter by degree, level, and subject to find what you need.",
  keywords: ["IITM BS notes", "study material", "resource bank", "contribute notes", "IITM BS degree resources"],
  openGraph: {
    title: "IITM BS Resources & Study Material | BSPrep",
    description: "Access curated study notes and community-contributed materials for all IITM BS subjects.",
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
