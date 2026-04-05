"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

type SearchItem = {
  label: string
  href: string
  keywords: string
}

const ITEMS: SearchItem[] = [
  { label: "Overview", href: "/admin", keywords: "dashboard home summary" },
  { label: "Users", href: "/admin/users", keywords: "students profiles accounts" },
  { label: "Announcements", href: "/admin/announcements", keywords: "notice updates posts" },
  { label: "Doubts", href: "/admin/doubts", keywords: "questions support replies" },
  { label: "Analytics", href: "/admin/analytics", keywords: "stats performance charts" },
  { label: "Resources Review", href: "/admin/resources", keywords: "submissions files approvals" },
  { label: "Admin Details", href: "/admin/details", keywords: "settings profile security" },
]

export function AdminManagementSearch() {
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      return ITEMS
    }

    return ITEMS.filter((item) => {
      const haystack = `${item.label} ${item.keywords}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [query])

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="admin-management-search" className="sr-only">
        Search management items
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b1425] px-3 py-2">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          id="admin-management-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search management items"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0b1220] p-1">
        {filteredItems.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">No matching admin pages found.</p>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
