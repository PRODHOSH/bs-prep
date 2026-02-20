"use client"

import DotGrid from '@/src/components/DotGrid'

export function BeamsBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-white">
      <DotGrid
        dotSize={3}
        gap={13}
        baseColor="rgba(0, 0, 0, 0.05)"
        activeColor="rgba(0, 0, 0, 0.05)"
        proximity={0}
        shockRadius={200}
        shockStrength={3}
        resistance={800}
        returnDuration={1.5}
      />
    </div>
  )
}
