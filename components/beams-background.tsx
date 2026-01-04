"use client"

import dynamic from 'next/dynamic'

const Beams = dynamic(() => import('@/src/components/Beams'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

export function BeamsBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Beams
        beamWidth={2}
        beamHeight={15}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={45}
      />
    </div>
  )
}
