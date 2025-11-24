import { useEffect, useState, useRef } from 'react'
import type { BlobControls } from './ControlPanel'

interface RGBBlobsProps {
  controls: BlobControls
  interactionPos: { x: number; y: number } | null
}

// Helper to generate random values for each blob's autonomous motion and response
const generateBlobMotion = () => ({
  xOffset: Math.random() * Math.PI * 2,
  yOffset: Math.random() * Math.PI * 2,
  xSpeed: 0.3 + Math.random() * 0.4,
  ySpeed: 0.3 + Math.random() * 0.4,
  sizeOffset: Math.random() * Math.PI * 2,
  sizeSpeed: 0.2 + Math.random() * 0.3,
  // Random multipliers for mouse response (can be negative for inverse movement)
  mouseXMultiplier: (Math.random() - 0.5) * 3, // Range: -1.5 to 1.5
  mouseYMultiplier: (Math.random() - 0.5) * 3,
  mouseSizeMultiplier: (Math.random() - 0.5) * 2, // Range: -1 to 1
})

export default function RGBBlobs({ controls, interactionPos }: RGBBlobsProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [blobMotions, setBlobMotions] = useState({
    red: generateBlobMotion(),
    green: generateBlobMotion(),
    blue: generateBlobMotion(),
  })
  const [interactionState, setInteractionState] = useState({
    active: false,
    startTime: 0,
    targetScale: 1,
    currentScale: 1,
    targetOffsetX: 0,
    targetOffsetY: 0,
    currentOffsetX: 0,
    currentOffsetY: 0,
  })
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const mouseMoveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mouse tracking with pause detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      // Detect if mouse has paused and then moved again
      const hasMovedSignificantly =
        Math.abs(x - lastMousePosRef.current.x) > 0.05 ||
        Math.abs(y - lastMousePosRef.current.y) > 0.05

      if (hasMovedSignificantly) {
        // Clear existing timer
        if (mouseMoveTimerRef.current) {
          clearTimeout(mouseMoveTimerRef.current)
        }

        // Set new timer - if mouse pauses for 200ms, regenerate multipliers on next move
        mouseMoveTimerRef.current = setTimeout(() => {
          // Mouse has paused, regenerate random multipliers for next movement
          setBlobMotions({
            red: generateBlobMotion(),
            green: generateBlobMotion(),
            blue: generateBlobMotion(),
          })
        }, 200)
      }

      lastMousePosRef.current = { x, y }
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (mouseMoveTimerRef.current) {
        clearTimeout(mouseMoveTimerRef.current)
      }
    }
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
      setRotation((r) => r + 0.01 * controls.rotationSpeed)
    }, 50)
    return () => clearInterval(interval)
  }, [controls.animationSpeed, controls.rotationSpeed])

  // Handle interaction (mouse/touch down)
  useEffect(() => {
    if (interactionPos) {
      // Start interaction with IMMEDIATE response
      const now = Date.now()
      const targetScale = 1.15
      const targetOffsetX = interactionPos.x * 30
      const targetOffsetY = interactionPos.y * 30

      setInteractionState((prev) => ({
        ...prev,
        active: true,
        startTime: now,
        targetScale,
        targetOffsetX,
        targetOffsetY,
        // Set current values immediately for instant feedback
        currentScale: 1.08, // Start partway there for immediate pop
        currentOffsetX: targetOffsetX * 0.5, // Immediate partial movement
        currentOffsetY: targetOffsetY * 0.5,
      }))

      // Regenerate blob motions for trajectory change
      setBlobMotions({
        red: generateBlobMotion(),
        green: generateBlobMotion(),
        blue: generateBlobMotion(),
      })
    } else {
      // End interaction
      setInteractionState((prev) => ({
        ...prev,
        active: false,
      }))
    }
  }, [interactionPos])

  // Animate interaction state with requestAnimationFrame for smoother performance
  useEffect(() => {
    let animationFrameId: number

    const animateInteraction = () => {
      setInteractionState((prev) => {
        if (prev.active) {
          const elapsed = (Date.now() - prev.startTime) / 1000
          const duration = controls.interactionIntensity

          if (elapsed < duration) {
            // Ease out animation
            const progress = elapsed / duration
            const easeOut = 1 - Math.pow(1 - progress, 3)

            return {
              ...prev,
              currentScale: 1 + (prev.targetScale - 1) * easeOut,
              currentOffsetX: prev.targetOffsetX * easeOut,
              currentOffsetY: prev.targetOffsetY * easeOut,
            }
          } else {
            // Keep at target values while still active (held down)
            return {
              ...prev,
              currentScale: prev.targetScale,
              currentOffsetX: prev.targetOffsetX,
              currentOffsetY: prev.targetOffsetY,
            }
          }
        } else {
          // Smooth return to normal
          const isClose = Math.abs(prev.currentScale - 1) < 0.01 &&
                         Math.abs(prev.currentOffsetX) < 0.5 &&
                         Math.abs(prev.currentOffsetY) < 0.5

          if (isClose) {
            return {
              ...prev,
              currentScale: 1,
              currentOffsetX: 0,
              currentOffsetY: 0,
            }
          }

          return {
            ...prev,
            currentScale: prev.currentScale * 0.85 + 1 * 0.15,
            currentOffsetX: prev.currentOffsetX * 0.85,
            currentOffsetY: prev.currentOffsetY * 0.85,
          }
        }
      })

      animationFrameId = requestAnimationFrame(animateInteraction)
    }

    animationFrameId = requestAnimationFrame(animateInteraction)
    return () => cancelAnimationFrame(animationFrameId)
  }, [controls.interactionIntensity, interactionState.active, interactionState.startTime])

  // Combine mouse/tilt with autonomous animation
  const baseX = mousePos.x || tilt.x
  const baseY = mousePos.y || tilt.y
  const sensitivity = controls.movementSensitivity
  const motionRange = controls.motionRange

  // Calculate aspect ratio variation
  const aspectVariation = controls.aspectRatioVariation / 100
  const aspectRatioX = 1 + Math.sin(time * 0.7) * aspectVariation * 0.5
  const aspectRatioY = 1 + Math.cos(time * 0.5) * aspectVariation * 0.5

  // Calculate positions and sizes for each blob with independent random response
  const calculateBlobTransform = (motion: ReturnType<typeof generateBlobMotion>) => {
    const autonomousX = Math.sin(time * motion.xSpeed + motion.xOffset) * motionRange
    const autonomousY = Math.cos(time * motion.ySpeed + motion.yOffset) * motionRange
    const sizeVariation = Math.sin(time * motion.sizeSpeed + motion.sizeOffset) * controls.sizeChangeRange

    // Each blob responds to mouse differently (can be opposite direction)
    const mouseInfluenceX = baseX * sensitivity * motion.mouseXMultiplier
    const mouseInfluenceY = baseY * sensitivity * motion.mouseYMultiplier
    const mouseSizeInfluence = (Math.abs(baseX) + Math.abs(baseY)) * motion.mouseSizeMultiplier * 20

    // Add interaction offset
    const totalX = mouseInfluenceX + autonomousX + interactionState.currentOffsetX
    const totalY = mouseInfluenceY + autonomousY + interactionState.currentOffsetY
    const totalScale = (1 + (sizeVariation + mouseSizeInfluence) / 100) * interactionState.currentScale

    return {
      x: totalX,
      y: totalY,
      scale: totalScale,
    }
  }

  const redTransform = calculateBlobTransform(blobMotions.red)
  const greenTransform = calculateBlobTransform(blobMotions.green)
  const blueTransform = calculateBlobTransform(blobMotions.blue)

  const { blobSize, blurAmount, colorOpacity, backgroundColor, containerPadding, blendMode } = controls

  // Calculate responsive blob size based on viewport
  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth
  const viewportMin = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : 800
  const responsiveBlobSize = isPortrait ? viewportMin * 0.6 : blobSize
  const responsiveBlur = isPortrait ? blurAmount * 0.8 : blurAmount

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
            width: `${responsiveBlobSize}px`,
            height: `${responsiveBlobSize}px`,
            filter: `blur(${responsiveBlur}px)`,
            background: `radial-gradient(circle, rgba(255,0,0,${colorOpacity}) 0%, rgba(255,0,0,${colorOpacity * 0.8}) 30%, rgba(255,0,0,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${redTransform.x}px, ${redTransform.y}px) rotate(${rotation}rad) scale(${redTransform.scale * aspectRatioX}, ${redTransform.scale * aspectRatioY})`,
            borderRadius: getBorderRadius(1.23),
          }}
        />

        {/* Green blob */}
        <div
          className="absolute top-1/2 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: `${responsiveBlobSize}px`,
            height: `${responsiveBlobSize}px`,
            filter: `blur(${responsiveBlur}px)`,
            background: `radial-gradient(circle, rgba(0,255,0,${colorOpacity}) 0%, rgba(0,255,0,${colorOpacity * 0.8}) 30%, rgba(0,255,0,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${greenTransform.x}px, ${greenTransform.y}px) rotate(${rotation * 1.3}rad) scale(${greenTransform.scale * aspectRatioX}, ${greenTransform.scale * aspectRatioY})`,
            borderRadius: getBorderRadius(2.47),
          }}
        />

        {/* Blue blob */}
        <div
          className="absolute top-1/2 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: `${responsiveBlobSize}px`,
            height: `${responsiveBlobSize}px`,
            filter: `blur(${responsiveBlur}px)`,
            background: `radial-gradient(circle, rgba(0,0,255,${colorOpacity}) 0%, rgba(0,0,255,${colorOpacity * 0.8}) 30%, rgba(0,0,255,0) 70%)`,
            mixBlendMode: blendMode as any,
            transform: `translate(-50%, -50%) translate(${blueTransform.x}px, ${blueTransform.y}px) rotate(${rotation * 0.7}rad) scale(${blueTransform.scale * aspectRatioX}, ${blueTransform.scale * aspectRatioY})`,
            borderRadius: getBorderRadius(3.71),
          }}
        />
      </div>
    </div>
  )
}
