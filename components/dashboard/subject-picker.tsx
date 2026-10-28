"use client"

import { Check } from "lucide-react"
import { SUBJECT_CHAT_COURSES } from "@/lib/chat/constants"
import { cn } from "@/lib/utils"

// "stats-2" and "foundation-stats-2" are the same subject: show it once, treat either id as selected.
export const SUBJECT_OPTIONS = Array.from(
  SUBJECT_CHAT_COURSES.reduce((map, c) => map.set(c.label, [...(map.get(c.label) ?? []), c.id]), new Map<string, string[]>()),
  ([label, ids]) => ({ label, ids }),
)

/** Labels for a list of stored subject ids, without duplicates. */
export function subjectLabels(ids: string[]): string[] {
  return SUBJECT_OPTIONS.filter((o) => o.ids.some((id) => ids.includes(id))).map((o) => o.label)
}

/** Tap-to-toggle subject chips. `value` and `onChange` work with stored course ids. */
export function SubjectPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {SUBJECT_OPTIONS.map((o) => {
        const on = o.ids.some((id) => value.includes(id))
        return (
          <li key={o.label}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onChange(on ? value.filter((id) => !o.ids.includes(id)) : [...value, o.ids[0]])}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                on ? "border-primary/40 bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                {on && <Check className="size-3" strokeWidth={3.5} />}
              </span>
              {o.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
