import { useState } from 'react'
import RGBBlobs from './components/RGBBlobs'
import ControlPanel, { BlobControls } from './components/ControlPanel'
import defaultSettings from './defaultSettings.json'

function App() {
  const [controls, setControls] = useState<BlobControls>(defaultSettings as BlobControls)

  return (
    <div className="w-full h-screen">
      <RGBBlobs controls={controls} />
      <ControlPanel controls={controls} onChange={setControls} />
    </div>
  )
}

export default App