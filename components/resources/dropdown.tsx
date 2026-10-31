"use client"

import * as Select from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropdownOption {
  value: string
  label: string
}

/**
 * A dropdown that looks like the rest of the site instead of the browser's own list.
 * "dashboard" follows the dashboard theme; "public" follows the landing pages.
 */
export function Dropdown({
  value,
  onChange,
  options,
  variant,
  placeholder = "Select",
  disabled,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  variant: "dashboard" | "public"
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const pub = variant === "public"
  return (
    <Select.Root value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        suppressHydrationWarning
        className={cn(
          "group flex w-full items-center justify-between gap-2 text-left text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-muted-foreground",
          pub
            ? "h-11 rounded-full border border-black/10 bg-white px-4 font-bold text-black hover:border-black/30 focus-visible:border-[#0a192f] data-[state=open]:border-[#0a192f]"
            : "h-10 rounded-xl border bg-background px-3 font-medium hover:bg-muted/50 focus-visible:border-foreground/40 data-[state=open]:border-foreground/40",
          className,
        )}
      >
        <span className="truncate">
          <Select.Value placeholder={placeholder} />
        </span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180", pub ? "text-black/50" : "text-muted-foreground")} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-[100] max-h-72 w-[var(--radix-select-trigger-width)] min-w-[10rem] overflow-hidden border shadow-xl",
            pub ? "rounded-2xl border-black/10 bg-white text-black" : "lms rounded-xl bg-popover text-popover-foreground",
          )}
        >
          <Select.Viewport className="max-h-72 overflow-y-auto p-1.5">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center gap-2 py-2 pl-3 pr-8 text-sm outline-none",
                  pub
                    ? "rounded-xl font-bold data-[highlighted]:bg-[#FDFBF7] data-[state=checked]:text-[#0a192f]"
                    : "rounded-lg font-medium data-[highlighted]:bg-muted data-[state=checked]:font-semibold",
                )}
              >
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2.5 grid place-items-center">
                  <Check className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
