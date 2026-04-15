"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"

type FloatingChatButtonProps = {
  href: string
  label?: string
}

export function FloatingChatButton({ href, label = "Chat" }: FloatingChatButtonProps) {
  const pathname = usePathname()

  if (!pathname || pathname === href) {
    return null
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#00a884] text-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.45)] transition hover:scale-105 hover:bg-[#02bd94]"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  )
}
