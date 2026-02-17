"use client"

import dynamic from 'next/dynamic'

const LightRays = dynamic(() => import('../src/components/LightRays'), {
  ssr: false,
})

export function BeamsBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        fadeDistance={1}
        saturation={1}
      />
    </div>
  )
}
