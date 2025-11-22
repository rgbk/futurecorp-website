import { useState } from 'react'
import RGBBlobs from './components/RGBBlobs'
import ControlPanel, { BlobControls } from './components/ControlPanel'
import defaultSettings from './defaultSettings.json'

function App() {
  const [controls, setControls] = useState<BlobControls>(defaultSettings as BlobControls)

  // Toggle background color between black and white
  const toggleBackground = () => {
    setControls((prev) => ({
      ...prev,
      backgroundColor: prev.backgroundColor === '#000000' ? '#ffffff' : '#000000',
    }))
  }

  return (
    <div className="w-full h-screen">
      <div
        className="w-full h-full cursor-pointer"
        onClick={toggleBackground}
      >
        <RGBBlobs controls={controls} />
      </div>
      <ControlPanel controls={controls} onChange={setControls} />
    </div>
  )
}

export default App