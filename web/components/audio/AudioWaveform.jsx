import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const WaveSurfer = dynamic(() => import("wavesurfer.js"), { ssr: false })

export default function AudioWaveform({ file }) {
  const containerRef = useRef(null)
  const waveRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!file || !containerRef.current) return

    setIsReady(false)
    
    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#7A2F1F",
      progressColor: "#C89B3C",
      cursorColor: "#C89B3C",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      normalize: true,
      backend: 'WebAudio',
    })

    waveRef.current.on('ready', () => {
      setIsReady(true)
      setDuration(waveRef.current.getDuration())
    })

    waveRef.current.on('play', () => setIsPlaying(true))
    waveRef.current.on('pause', () => setIsPlaying(false))
    waveRef.current.on('finish', () => setIsPlaying(false))

    waveRef.current.load(URL.createObjectURL(file))

    return () => {
      if (waveRef.current) {
        waveRef.current.destroy()
      }
    }
  }, [file])

  const togglePlay = () => {
    if (waveRef.current) {
      waveRef.current.playPause()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!file) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-32 md:h-40 bg-charcoal-light/20 rounded-xl border border-gold/10"
      >
        <div className="text-center px-4">
          <svg className="w-12 h-12 mx-auto mb-3 text-ivory/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-ivory/40 text-sm md:text-base">Upload an audio file to visualize the waveform</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div ref={containerRef} className="waveform-container relative" />
      
      <AnimatePresence>
        {isReady && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {/* Time Display */}
            <div className="flex items-center gap-2 text-sm text-ivory/60 font-mono">
              <span>00:00</span>
              <span className="text-gold/50">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Play Button */}
            <button
              onClick={togglePlay}
              className={`
                flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full
                transition-all duration-300
                ${isPlaying 
                  ? 'bg-brick text-ivory hover:bg-brick-light shadow-brick-glow' 
                  : 'bg-gold text-charcoal hover:bg-gold-light shadow-gold-glow'
                }
                hover:scale-110 active:scale-95
              `}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 md:w-7 md:h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs hidden md:block">
              <div className="h-1 bg-charcoal-light rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-brick via-gold to-brick"
                  initial={{ width: 0 }}
                  animate={{ width: isPlaying ? '100%' : '0%' }}
                  transition={{ duration: duration, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
