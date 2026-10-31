import type { ReactNode } from "react"
import { Illustration } from "./illustration"

/** The top of every quiz prep page: a title and one line of guidance on the left, one illustration on the right. */
export function Banner({ title, description, art, actions }: { title: string; description?: ReactNode; art?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 overflow-hidden rounded-3xl border bg-card px-6 py-6 sm:px-8">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {art && <Illustration name={art} className="hidden h-32 w-auto shrink-0 sm:block lg:h-36" />}
    </div>
  )
}

/** Icon holder used on cards. One neutral style everywhere, so colour is reserved for state. */
export function Tile({ icon: Icon, className = "" }: { icon: React.ElementType; className?: string }) {
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground ${className}`}>
      <Icon className="size-5" />
    </span>
  )
}
