"use client"

import React from "react"
import { ChevronRight } from "lucide-react"

interface SelectionCardProps {
  label: string
  description?: string
  onClick: () => void
  active?: boolean
}

export function SelectionCard({ label, description, onClick, active = false }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-between rounded-lg border px-5 py-4",
        "text-left transition-all duration-200",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-200 bg-white text-black hover:border-black hover:shadow-sm",
      ].join(" ")}
    >
      <div className="space-y-0.5">
        <span className="block text-sm font-semibold tracking-tight">{label}</span>
        {description && (
          <span className={["block text-xs", active ? "text-neutral-300" : "text-neutral-500"].join(" ")}>
            {description}
          </span>
        )}
      </div>
      <ChevronRight
        className={[
          "ml-4 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
          active ? "text-white" : "text-neutral-400",
        ].join(" ")}
      />
    </button>
  )
}

interface StepHeaderProps {
  step: number
  total: number
  title: string
  subtitle?: string
  onBack?: () => void
}

export function StepHeader({ step, total, title, subtitle, onBack }: StepHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back
          </button>
        )}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={[
                "h-1 rounded-full transition-all duration-300",
                i <= step ? "w-6 bg-black" : "w-3 bg-neutral-200",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="ml-1 text-xs text-neutral-400">Step {step + 1} of {total}</span>
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-black">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  )
}
