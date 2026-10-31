"use client"

/** Optional artwork from /public/illustrations. If the file is not there yet, nothing is drawn. */
export function Illustration({ name, className }: { name: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/illustrations/${name}.svg`} alt="" aria-hidden onError={(e) => (e.currentTarget.style.display = "none")} className={className} />
  )
}
