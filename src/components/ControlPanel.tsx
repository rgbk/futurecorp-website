import { useState, useEffect } from 'react'
import defaultSettings from '../defaultSettings.json'

export interface BlobControls {
  blurAmount: number
  blobSize: number
  movementSensitivity: number
  animationSpeed: number
  colorOpacity: number
  motionRange: number
  sizeChangeRange: number
  backgroundColor: string
  containerPadding: number
  blendMode: string
}

interface ControlPanelProps {
  controls: BlobControls
  onChange: (controls: BlobControls) => void
}

export default function ControlPanel({ controls, onChange }: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateControl = (key: keyof BlobControls, value: number) => {
    onChange({ ...controls, [key]: value })
  }

  // Keyboard shortcut: Press 'X' to toggle panel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Copy settings to clipboard
  const copySettings = async () => {
    const json = JSON.stringify(controls, null, 2)
    try {
      await navigator.clipboard.writeText(json)
      alert('Settings copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      {/* Control Panel - Press X to toggle */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 bg-white/10 backdrop-blur-md text-white p-6 rounded-lg border border-white/20 w-80 shadow-2xl max-h-[calc(100vh-160px)] overflow-y-auto" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
          <h3 className="text-xs uppercase tracking-wider mb-4 opacity-60">RGB Blob Controls</h3>

          <div className="space-y-4">
            {/* Blur Amount */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Blur: {controls.blurAmount}px
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={controls.blurAmount}
                onChange={(e) => updateControl('blurAmount', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Blob Size */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Size: {controls.blobSize}px
              </label>
              <input
                type="range"
                min="200"
                max="1000"
                value={controls.blobSize}
                onChange={(e) => updateControl('blobSize', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Movement Sensitivity */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Movement: {controls.movementSensitivity}x
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={controls.movementSensitivity}
                onChange={(e) => updateControl('movementSensitivity', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Animation Speed */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Speed: {controls.animationSpeed.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={controls.animationSpeed}
                onChange={(e) => updateControl('animationSpeed', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Color Opacity */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Opacity: {Math.round(controls.colorOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={controls.colorOpacity}
                onChange={(e) => updateControl('colorOpacity', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Motion Range */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Motion Range: {controls.motionRange}px
              </label>
              <input
                type="range"
                min="0"
                max="300"
                value={controls.motionRange}
                onChange={(e) => updateControl('motionRange', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Size Change Range */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Size Pulse: {controls.sizeChangeRange}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={controls.sizeChangeRange}
                onChange={(e) => updateControl('sizeChangeRange', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Container Padding */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">
                Padding: {controls.containerPadding}px
              </label>
              <input
                type="range"
                min="0"
                max="400"
                value={controls.containerPadding}
                onChange={(e) => updateControl('containerPadding', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={controls.backgroundColor}
                  onChange={(e) => updateControl('backgroundColor', e.target.value as any)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={controls.backgroundColor}
                  onChange={(e) => updateControl('backgroundColor', e.target.value as any)}
                  className="flex-1 bg-white/10 text-white px-2 rounded border border-white/20 text-sm"
                />
              </div>
            </div>

            {/* Blend Mode */}
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-2 opacity-60">Blend Mode</label>
              <select
                value={controls.blendMode}
                onChange={(e) => updateControl('blendMode', e.target.value as any)}
                className="w-full bg-white/10 text-white px-2 py-2 rounded border border-white/20 cursor-pointer"
              >
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
                <option value="screen">Screen</option>
                <option value="multiply">Multiply</option>
                <option value="overlay">Overlay</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="hard-light">Hard Light</option>
                <option value="soft-light">Soft Light</option>
              </select>
            </div>

            {/* Copy Settings Button */}
            <button
              onClick={copySettings}
              className="w-full mt-4 bg-green-600/40 hover:bg-green-600/60 text-white py-2 rounded transition-all text-[10px] uppercase tracking-wide"
            >
              Copy Settings JSON
            </button>

            {/* Reset Button */}
            <button
              onClick={() => onChange(defaultSettings as BlobControls)}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded transition-all text-[10px] uppercase tracking-wide"
            >
              Reset to Defaults
            </button>

            {/* Keyboard Hint */}
            <p className="text-[9px] uppercase tracking-wide opacity-40 text-center mt-2">
              Press X to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
