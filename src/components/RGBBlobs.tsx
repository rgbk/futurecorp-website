import { useEffect, useState, useMemo } from 'react'
import type { BlobControls } from './ControlPanel'

interface RGBBlobsProps {
  controls: BlobControls
}

// Helper to generate random values for each blob's autonomous motion
const generateBlobMotion = () => ({
  xOffset: Math.random() * Math.PI * 2,
  yOffset: Math.random() * Math.PI * 2,
  xSpeed: 0.3 + Math.random() * 0.4,
  ySpeed: 0.3 + Math.random() * 0.4,
  sizeOffset: Math.random() * Math.PI * 2,
  sizeSpeed: 0.2 + Math.random() * 0.3,
})

export default function RGBBlobs({ controls }: RGBBlobsProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)

  // Generate unique motion patterns for each blob (only once)
  const blobMotions = useMemo(
    () => ({
      red: generateBlobMotion(),
      green: generateBlobMotion(),
      blue: generateBlobMotion(),
    }),
    []
  )

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Device orientation for mobile
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        const x = Math.max(-1, Math.min(1, e.gamma / 45))
        const y = Math.max(-1, Math.min(1, e.beta / 45))
        setTilt({ x, y })
      }
    }

    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        })
    } else {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.01 * controls.animationSpeed)
    }, 50)
    return () => clearInterval(interval)
  }, [controls.animationSpeed])

  // Combine mouse/tilt with autonomous animation
  const baseX = mousePos.x || tilt.x
  const baseY = mousePos.y || tilt.y
  const sensitivity = controls.movementSensitivity
  const motionRange = controls.motionRange

  // Calculate positions and sizes for each blob
  const calculateBlobTransform = (motion: ReturnType<typeof generateBlobMotion>, multiplier: number) => {
    const autonomousX = Math.sin(time * motion.xSpeed + motion.xOffset) * motionRange
    const autonomousY = Math.cos(time * motion.ySpeed + motion.yOffset) * motionRange
    const sizeVariation = Math.sin(time * motion.sizeSpeed + motion.sizeOffset) * controls.sizeChangeRange

    return {
      x: baseX * (sensitivity * multiplier) + autonomousX,
      y: baseY * (sensitivity * multiplier) + autonomousY,
      scale: 1 + sizeVariation / 100,
    }
  }

  const redTransform = calculateBlobTransform(blobMotions.red, 1.0)
  const greenTransform = calculateBlobTransform(blobMotions.green, 0.85)
  const blueTransform = calculateBlobTransform(blobMotions.blue, 0.92)

  const { blobSize, blurAmount, colorOpacity, backgroundColor, containerPadding, blendMode } = controls

  // Generate imperfect circle border-radius
  const getBorderRadius = (seed: number) => {
    const variation = 10
    return `${45 + Math.sin(seed) * variation}% ${55 + Math.cos(seed * 1.3) * variation}% ${50 + Math.sin(seed * 0.7) * variation}% ${50 + Math.cos(seed * 1.7) * variation}% / ${50 + Math.sin(seed * 1.1) * variation}% ${50 + Math.cos(seed * 0.9) * variation}% ${55 + Math.sin(seed * 1.5) * variation}% ${45 + Math.cos(seed * 1.9) * variation}%`
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center transition-colors duration-500"
      style={{ backgroundColor }}
    >
      <div
        className="relative"
        style={{
          width: `calc(100% - ${containerPadding * 2}px)`,
          height: `calc(100% - ${containerPadding * 2}px)`,
        }}
      >
        {/* Red blob */}
        <div
          className="absolute top-1/2 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: `${blobSize}px`,
            height: `${blobSize}px`,
            filter: `blur(${blurAmount}px)`,
            background: `radial-gradient(circle, rgba(255,0,0,${colorOpacity}) 0%, rgba(255,0,0,${colorOpacity * 0.8}) 30%, rgba(255,0,0,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${redTransform.x}px, ${redTransform.y}px) scale(${redTransform.scale})`,
            borderRadius: getBorderRadius(1.23),
          }}
        />

        {/* Green blob */}
        <div
          className="absolute top-1/2 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: `${blobSize}px`,
            height: `${blobSize}px`,
            filter: `blur(${blurAmount}px)`,
            background: `radial-gradient(circle, rgba(0,255,0,${colorOpacity}) 0%, rgba(0,255,0,${colorOpacity * 0.8}) 30%, rgba(0,255,0,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${greenTransform.x}px, ${greenTransform.y}px) scale(${greenTransform.scale})`,
            borderRadius: getBorderRadius(2.47),
          }}
        />

        {/* Blue blob */}
        <div
          className="absolute top-1/2 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: `${blobSize}px`,
            height: `${blobSize}px`,
            filter: `blur(${blurAmount}px)`,
            background: `radial-gradient(circle, rgba(0,0,255,${colorOpacity}) 0%, rgba(0,0,255,${colorOpacity * 0.8}) 30%, rgba(0,0,255,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${blueTransform.x}px, ${blueTransform.y}px) scale(${blueTransform.scale})`,
            borderRadius: getBorderRadius(3.71),
          }}
        />
      </div>
    </div>
  )
}
