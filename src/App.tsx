import { useState } from 'react'
import RGBBlobs from './components/RGBBlobs'
import ControlPanel, { BlobControls } from './components/ControlPanel'
import defaultSettings from './defaultSettings.json'

function App() {
  const [controls, setControls] = useState<BlobControls>(defaultSettings as BlobControls)
  const [interactionPos, setInteractionPos] = useState<{ x: number; y: number } | null>(null)

  // Handle mouse/touch down - trigger blob interaction
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent default browser behaviors like selection

    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX / window.innerWidth - 0.5) * 2
    const y = (clientY / window.innerHeight - 0.5) * 2
    setInteractionPos({ x, y })
  }

  // Handle mouse/touch up - toggle background color
  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent default browser behaviors

    setInteractionPos(null)
    setControls((prev) => ({
      ...prev,
      backgroundColor: prev.backgroundColor === '#000000' ? '#ffffff' : '#000000',
    }))
  }

  return (
    <div className="w-full h-screen">
      <div
        className="w-full h-full cursor-pointer select-none"
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          touchAction: 'manipulation', // Allow fast taps but prevent zoom/scroll
        }}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
      >
        <RGBBlobs controls={controls} interactionPos={interactionPos} />
      </div>
      <ControlPanel controls={controls} onChange={setControls} />
    </div>
  )
}

export default App