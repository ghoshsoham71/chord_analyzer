import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Guitar chord diagrams
const GUITAR_CHORDS = {
  "Cmaj7": { name: "C Major 7", fingers: [0, 0, 0, 2, 3, 0], barre: null, position: "3fr", complexity: "Intermediate", difficulty: 3, strumming: "Down Down-Up Up-Down-Up" },
  "Am7": { name: "A Minor 7", fingers: [0, 0, 0, 0, 3, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down-Up" },
  "Dm7": { name: "D Minor 7", fingers: [1, 1, 1, 1, 3, 1], barre: 1, position: "X", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down-Up" },
  "G7": { name: "G Dominant 7", fingers: [3, 2, 0, 0, 0, 1], barre: null, position: "3fr", complexity: "Intermediate", difficulty: 2, strumming: "Down-Down-Up Up-Down-Up" },
  "Em7": { name: "E Minor 7", fingers: [0, 2, 0, 0, 3, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down" },
  "Fmaj7": { name: "F Major 7", fingers: [1, 0, 0, 2, 3, 0], barre: null, position: "1fr", complexity: "Advanced", difficulty: 4, strumming: "Down-Down-Up Up-Down-Up" },
  "Cm": { name: "C Minor", fingers: [3, 5, 5, 3, 3, 3], barre: 3, position: "3fr", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down" },
  "Am": { name: "A Minor", fingers: [2, 0, 2, 2, 1, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down-Up" },
  "Dm": { name: "D Minor", fingers: [1, 3, 2, 1, 1, 1], barre: 1, position: "X", complexity: "Intermediate", difficulty: 2, strumming: "Down Down-Up Up-Down" },
  "Em": { name: "E Minor", fingers: [0, 2, 2, 0, 0, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down" },
  "G": { name: "G Major", fingers: [3, 2, 0, 0, 0, 3], barre: null, position: "3fr", complexity: "Beginner", difficulty: 1, strumming: "Down-Down-Up Up-Down-Up" },
  "C": { name: "C Major", fingers: [0, 1, 0, 2, 3, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down-Up" },
  "D": { name: "D Major", fingers: [2, 3, 2, 0, 0, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down" },
  "E7": { name: "E7", fingers: [0, 2, 0, 1, 0, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down-Down-Up Up-Down" },
  "A7": { name: "A7", fingers: [0, 0, 2, 0, 3, 0], barre: null, position: "X", complexity: "Beginner", difficulty: 1, strumming: "Down Down-Up Up-Down" },
  "F": { name: "F Major", fingers: [1, 0, 0, 2, 3, 0], barre: 1, position: "1fr", complexity: "Advanced", difficulty: 4, strumming: "Down-Down-Up Up-Down-Up" },
  "Bm": { name: "B Minor", fingers: [2, 4, 4, 2, 2, 2], barre: 2, position: "X", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down" },
  "Bb7": { name: "Bb Dominant 7", fingers: [1, 3, 3, 2, 4, 2], barre: 1, position: "1fr", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down-Up" },
  "Eb": { name: "Eb Major", fingers: [1, 3, 3, 2, 3, 1], barre: 1, position: "1fr", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down" },
  "G7sus": { name: "G7 Sus4", fingers: [3, 3, 0, 0, 1, 3], barre: null, position: "3fr", complexity: "Intermediate", difficulty: 2, strumming: "Down Down-Up Up-Down" },
  "Cm7": { name: "C Minor 7", fingers: [3, 5, 3, 3, 4, 3], barre: 3, position: "3fr", complexity: "Intermediate", difficulty: 3, strumming: "Down-Down-Up Up-Down-Up" },
  "F7": { name: "F Dominant 7", fingers: [1, 0, 0, 2, 1, 0], barre: null, position: "1fr", complexity: "Intermediate", difficulty: 2, strumming: "Down-Down-Up Up-Down" },
}

// Album cover colors (fallback when no image)
const ALBUM_COLORS = {
  "An Evening with Silk Sonic": { bg: "from-amber-600 to-yellow-800", text: "SDS" },
  "After Hours": { bg: "from-red-900 to-red-700", text: "AH" },
  "÷": { bg: "from-blue-600 to-blue-800", text: "÷" },
  "21": { bg: "from-black to-gray-800", text: "21" },
  "x": { bg: "from-gray-600 to-gray-800", text: "x" },
  "Uptown Special": { bg: "from-purple-600 to-purple-900", text: "US" },
  "Doo-Wops & Hooligans": { bg: "from-red-600 to-red-800", text: "D&H" },
  "Unorthodox Jukebox": { bg: "from-yellow-600 to-orange-800", text: "UJ" },
  "24K Magic": { bg: "from-cyan-600 to-blue-700", text: "24K" },
  "Tangled Up": { bg: "from-green-600 to-green-800", text: "TU" },
  "Take Time": { bg: "from-indigo-600 to-indigo-800", text: "TT" },
  "7": { bg: "from-pink-600 to-purple-800", text: "7" },
  "Spider-Man": { bg: "from-blue-500 to-red-600", text: "SM" },
}

// Chord transpose map
const CHORD_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function transposeChord(chord, semitones) {
  const isMinor = chord.includes("m") && !chord.includes("maj")
  const isMaj7 = chord.includes("maj7")
  const isDim = chord.includes("dim")
  const isAug = chord.includes("aug")
  const is7 = chord.includes("7") && !isMaj7
  const isSus = chord.includes("sus")
  
  let root = chord.replace(/m|7|maj7|dim|aug|sus[24]?/g, "").replace("#", "♯").replace("b", "♭")
  
  if (root.includes("♯")) root = root.replace("♯", "#")
  if (root.includes("♭")) root = root.replace("♭", "b")
  
  let rootIndex = CHORD_NOTES.findIndex(n => n === root || n.replace("#", "♯") === root)
  if (rootIndex === -1) return chord
  
  let newRootIndex = (rootIndex + semitones + 12) % 12
  let newRoot = CHORD_NOTES[newRootIndex]
  
  if (isMaj7) return newRoot + "maj7"
  if (isDim) return newRoot + "dim"
  if (isAug) return newRoot + "aug"
  if (is7) return newRoot + "7"
  if (isSus) return newRoot + "sus4"
  if (isMinor) return newRoot + "m"
  return newRoot
}

// Album Cover Component with real image support
function AlbumCover({ album, albumCoverUrl }) {
  const albumData = ALBUM_COLORS[album]
  
  // If we have a real album cover URL, use it
  if (albumCoverUrl) {
    return (
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-charcoal-light to-charcoal flex-shrink-0">
        <img 
          src={albumCoverUrl} 
          alt={album} 
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  return (
    <div className={`w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br ${albumData?.bg || 'from-gray-600 to-gray-800'} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold text-lg">{albumData?.text || album?.charAt(0) || "♪"}</span>
    </div>
  )
}

// Guitar Chord Popup
function ChordPopup({ chord, isOpen, onClose }) {
  const chordData = GUITAR_CHORDS[chord] || GUITAR_CHORDS["Cmaj7"]
  
  if (!isOpen) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
      <motion.div
        className="relative glass-panel rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal-light flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-2xl font-bold gradient-text text-center mb-4">{chordData.name}</h3>
        
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 60 80" className="w-32 h-40">
            <rect x="10" y="10" width="40" height="55" fill="none" stroke="#C0C0C0" strokeWidth="1" opacity="0.3" />
            {[20, 30, 40, 50, 60].map((y, i) => (
              <line key={i} x1="10" y1={y} x2="50" y2={y} stroke="#C0C0C0" strokeWidth="0.5" opacity="0.3" />
            ))}
            {[15, 25, 35, 45, 50, 55].map((x, i) => (
              <line key={i} x1={x} y1="10" x2={x} y2="65" stroke="#C0C0C0" strokeWidth="0.5" opacity="0.3" />
            ))}
            {chordData.fingers.map((finger, i) => (
              finger > 0 && (
                <circle key={i} cx={15 + i * 8} cy={15 + (finger - 1) * 12.5} r="4" fill="#C0C0C0" />
              )
            ))}
            {chordData.barre && (
              <rect x="10" y={12 + (chordData.barre - 1) * 12.5 - 3} width="40" height="6" fill="#C0C0C0" opacity="0.6" rx="2" />
            )}
          </svg>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-ivory/60 text-sm mb-2">Finger Positions:</p>
          <div className="flex justify-center gap-2">
            {chordData.fingers.map((f, i) => (
              <span key={i} className="w-8 h-8 rounded-lg bg-charcoal-light flex items-center justify-center text-silver text-sm">
                {f === 0 ? "○" : f}
              </span>
            ))}
          </div>
          <p className="text-xs text-ivory/40 mt-2">E A D G B E</p>
        </div>

        {/* Strumming Pattern */}
        <div className="text-center mb-4 p-3 bg-charcoal-light/50 rounded-lg">
          <p className="text-ivory/60 text-sm mb-1">Strumming Pattern:</p>
          <p className="text-gold font-medium text-sm">{chordData.strumming || "Down-Down-Up Up-Down-Up"}</p>
        </div>
        
        <div className="text-center">
          <span className={`px-3 py-1 rounded-full text-xs ${
            chordData.complexity === "Beginner" ? "bg-emerald-500/20 text-emerald-400" :
            chordData.complexity === "Intermediate" ? "bg-silver/20 text-silver" :
            "bg-red-500/20 text-red-400"
          }`}>
            {chordData.complexity}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HarmonyGraph({ songData }) {
  const [isClient, setIsClient] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [transpose, setTranspose] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedChord, setSelectedChord] = useState("Cmaj7")
  const [showAllChords, setShowAllChords] = useState(true)
  const progressRef = useRef(null)
  const timelineRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(Date.now())

  // Calculate duration from song data
  const duration = songData?.duration_seconds || 180
  
  // Get chord timeline from song data or use empty
  const chordTimeline = songData?.timeline || []

  // Extract unique chords with their occurrences
  const uniqueChords = useMemo(() => {
    const chordMap = new Map()
    chordTimeline.forEach((item, index) => {
      const transposedChord = transposeChord(item.chord, transpose)
      if (!chordMap.has(transposedChord)) {
        chordMap.set(transposedChord, {
          chord: transposedChord,
          occurrences: [],
          firstLyric: item.lyric,
          firstSection: item.section,
          firstTime: item.time
        })
      }
      chordMap.get(transposedChord).occurrences.push({
        time: item.time,
        lyric: item.lyric,
        section: item.section,
        index
      })
    })
    return Array.from(chordMap.values())
  }, [chordTimeline, transpose])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleTranspose = (semitones) => {
    setTranspose(prev => (prev + semitones + 12) % 12 - (semitones > 0 ? 0 : 0))
  }

  const getTransposedChord = (chord) => {
    return transposeChord(chord, transpose)
  }

  // Animation loop
  useEffect(() => {
    if (isPlaying && chordTimeline.length > 0) {
      lastTimeRef.current = Date.now()
      
      const animate = () => {
        const now = Date.now()
        const delta = (now - lastTimeRef.current) / 1000
        lastTimeRef.current = now
        
        setCurrentTime(prev => {
          const newTime = prev + (delta / duration * 100)
          if (newTime >= 100) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
        
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, duration, chordTimeline.length])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const handleTimelineClick = (e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setCurrentTime(percentage)
    }
  }

  const openChordPopup = (chord) => {
    setSelectedChord(chord)
    setShowPopup(true)
  }

  // Get current chord
  const getCurrentChord = () => {
    if (chordTimeline.length === 0) return { chord: "C", lyric: "", section: "" }
    
    const currentSeconds = (currentTime / 100) * duration
    return chordTimeline.find((t, i) => {
      const timeParts = t.time.split(':')
      const itemSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1])
      const nextItem = chordTimeline[i + 1]
      const nextSeconds = nextItem ? 
        parseInt(nextItem.time.split(':')[0]) * 60 + parseInt(nextItem.time.split(':')[1]) : 
        duration
      return currentSeconds >= itemSeconds && currentSeconds < nextSeconds
    }) || chordTimeline[0]
  }

  const currentChordData = getCurrentChord()

  const formatTime = (percentage) => {
    const totalSeconds = (percentage / 100) * duration
    const mins = Math.floor(totalSeconds / 60)
    const secs = Math.floor(totalSeconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total timeline width based on duration - more space between items
  const pixelsPerSecond = 4
  const totalWidth = duration * pixelsPerSecond

  // Get current strumming pattern
  const currentStrumming = useMemo(() => {
    const chordData = GUITAR_CHORDS[currentChordData.chord]
    return chordData?.strumming || "Down-Down-Up Up-Down-Up"
  }, [currentChordData.chord])

  if (!isClient) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-2 border-silver/30 border-t-silver rounded-full animate-spin" />
          <p className="text-silver/60 text-sm">Loading timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-silver/10 bg-gradient-to-b from-charcoal-light/40 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Album Cover */}
              <AlbumCover album={songData?.album} albumCoverUrl={songData?.albumCoverUrl} />
              
              <div>
                <h3 className="text-xl font-bold text-silver">{songData?.title || "Unknown Title"}</h3>
                <p className="text-ivory/60">{songData?.artist || "Unknown Artist"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Toggle */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-charcoal-light/50">
                <button
                  onClick={() => setShowAllChords(!showAllChords)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${showAllChords ? 'bg-silver/20 text-silver' : 'text-ivory/40'}`}
                >
                  {showAllChords ? 'All Chords' : 'Unique'}
                </button>
              </div>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-charcoal-light/50">
                <button
                  onClick={() => handleTranspose(-1)}
                  className="w-6 h-6 rounded bg-charcoal-light text-ivory/60 hover:text-silver text-xs font-bold"
                >
                  -
                </button>
                <span className="text-xs text-ivory/40 w-8 text-center">
                  {transpose > 0 ? `+${transpose}` : transpose === 0 ? "0" : transpose}
                </span>
                <button
                  onClick={() => handleTranspose(1)}
                  className="w-6 h-6 rounded bg-charcoal-light text-ivory/60 hover:text-silver text-xs font-bold"
                >
                  +
                </button>
              </div>
              
              <span className="text-silver font-mono text-sm">
                {formatTime(currentTime)}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-silver to-charcoal-light flex items-center justify-center shadow-lg border border-silver/30"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-charcoal" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-charcoal ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="mt-4 h-2 bg-charcoal-light/60 rounded-full cursor-pointer overflow-hidden"
            onClick={handleTimelineClick}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-charcoal-light via-silver to-charcoal-light"
              style={{ width: `${currentTime}%` }}
            />
          </div>
        </div>

        {/* Lyrics Timeline - Horizontal Scroll with Sliding Animation */}
        <div 
          className="overflow-x-auto border-b border-silver/10 bg-charcoal-light/20"
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
        >
          <style jsx>{`
            .overflow-x-auto::-webkit-scrollbar {
              height: 6px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
              background: rgba(255, 215, 0, 0.3);
              border-radius: 3px;
            }
          `}</style>
          
          <div 
            className="relative h-20 flex items-center"
            style={{ minWidth: `${totalWidth}px`, paddingLeft: '20px', paddingRight: '20px' }}
          >
            {/* Sliding Lyrics Container - Shows current and upcoming lyrics */}
            <div className="absolute inset-x-0 flex items-center justify-center overflow-hidden">
              {/* Previous lyric sliding out to the left (oblivion) */}
              <AnimatePresence mode="popLayout">
                {chordTimeline.map((item, index) => {
                  const timeParts = item.time.split(':')
                  const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1])
                  const timePercent = (seconds / duration) * 100
                  
                  // Show previous lyric that's about to leave
                  const isExiting = currentTime > timePercent && currentTime < timePercent + 3
                  const isCurrent = Math.abs(currentTime - timePercent) < 2
                  
                  if (!isExiting) return null
                  
                  return (
                    <motion.div
                      key={`exiting-${index}`}
                      initial={{ x: 0, opacity: 1 }}
                      animate={{ x: -200, opacity: 0 }}
                      exit={{ x: -200, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeIn" }}
                      className="absolute px-4 py-2 rounded-full text-sm bg-charcoal-light/80 border border-silver/20 text-ivory/60 whitespace-nowrap"
                    >
                      {item.lyric || "♪"}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {/* Current lyric */}
              {currentChordData && (
                <motion.div
                  key={`current-${currentChordData.time}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-6 py-2 rounded-full text-base bg-gold text-charcoal font-bold z-20 shadow-lg"
                >
                  {currentChordData.lyric || "♪"}
                </motion.div>
              )}
              
              {/* Next lyric sliding in from right */}
              <AnimatePresence>
                {chordTimeline.map((item, index) => {
                  const timeParts = item.time.split(':')
                  const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1])
                  const timePercent = (seconds / duration) * 100
                  
                  // Show next lyric coming in
                  const isEntering = currentTime < timePercent && currentTime > timePercent - 5
                  
                  if (!isEntering) return null
                  
                  return (
                    <motion.div
                      key={`entering-${index}`}
                      initial={{ x: 200, opacity: 0 }}
                      animate={{ x: 80, opacity: 0.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute px-4 py-2 rounded-full text-sm bg-charcoal-light/60 border border-silver/10 text-ivory/40 whitespace-nowrap"
                    >
                      {item.lyric || "♪"}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            
            {/* Current position indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-gold z-20"
              style={{ left: `${(currentTime / 100) * totalWidth + 20}px` }}
            />
          </div>
        </div>

        {/* Chord Timeline - Horizontal Scroll */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto"
          style={{ overflowX: 'auto', overflowY: 'hidden', maxHeight: '320px' }}
        >
          <style jsx>{`
            .overflow-x-auto::-webkit-scrollbar {
              height: 10px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
              background: rgba(14, 14, 14, 0.8);
              border-radius: 5px;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
              background: linear-gradient(to right, #C0C0C0, #E8E8E8, #C0C0C0);
              border-radius: 5px;
              border: 2px solid rgba(14, 14, 14, 0.8);
            }
          `}</style>
          
          <div 
            ref={timelineRef}
            className="relative"
            style={{ 
              width: `${totalWidth + 40}px`,
              minWidth: '100%',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '20px'
            }}
          >
            {/* Time markers */}
            {Array.from({ length: Math.ceil(duration / 30) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-silver/10"
                style={{ left: `${i * 30 * pixelsPerSecond + 20}px` }}
              >
                <span className="absolute -top-1 left-1 text-xs text-ivory/40 whitespace-nowrap">
                  {i * 30 < 60 ? `${i * 30}:00` : `${Math.floor(i * 30 / 60)}:${(i * 30 % 60).toString().padStart(2, '0')}`}
                </span>
              </div>
            ))}
            
            {/* All Chords View */}
            {showAllChords && (
              <div className="flex flex-wrap gap-2 pt-8">
                {chordTimeline.map((item, index) => {
                  const timeParts = item.time.split(':')
                  const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1])
                  const timePercent = (seconds / duration) * 100
                  const isCurrent = Math.abs(currentTime - timePercent) < 2
                  
                  return (
                    <motion.div
                      key={index}
                      className={`
                        flex flex-col items-center p-3 rounded-xl border transition-all min-w-[100px]
                        ${isCurrent 
                          ? 'bg-silver/20 border-silver z-10 shadow-lg' 
                          : 'bg-charcoal-light/40 border-silver/10 hover:border-silver/30'
                        }
                      `}
                    >
                      <span className={`text-xs font-mono mb-1 ${isCurrent ? 'text-silver' : 'text-ivory/40'}`}>
                        {item.time}
                      </span>
                      <button
                        onClick={() => openChordPopup(getTransposedChord(item.chord))}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-bold
                          ${isCurrent 
                            ? 'bg-silver text-charcoal' 
                            : 'bg-charcoal-light text-silver hover:bg-silver/20'
                          }
                        `}
                      >
                        {getTransposedChord(item.chord)}
                      </button>
                      {item.lyric && (
                        <span className={`text-[10px] mt-2 max-w-[90px] truncate text-center ${isCurrent ? 'text-ivory' : 'text-ivory/50'}`}>
                          {item.lyric}
                        </span>
                      )}
                      <span className="text-[8px] text-ivory/30 mt-1">{item.section}</span>
                    </motion.div>
                  )
                })}
              </div>
            )}
            
            {/* Unique Chords View */}
            {!showAllChords && uniqueChords.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-8">
                {uniqueChords.map((uniqueChord, idx) => {
                  const isCurrent = getTransposedChord(currentChordData.chord) === uniqueChord.chord
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer
                        ${isCurrent 
                          ? 'bg-silver/20 border-silver shadow-lg' 
                          : 'bg-charcoal-light/60 border-silver/20 hover:border-silver/50'
                        }
                      `}
                      style={{ minWidth: '180px' }}
                      onClick={() => openChordPopup(uniqueChord.chord)}
                    >
                      <div className="flex items-center justify-center w-full mb-2">
                        <span className={`text-xl font-bold ${isCurrent ? 'text-silver' : 'text-silver/80'}`}>
                          {uniqueChord.chord}
                        </span>
                        {uniqueChord.occurrences.length > 1 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold">
                            ×{uniqueChord.occurrences.length}
                          </span>
                        )}
                      </div>
                      
                      {uniqueChord.firstLyric && (
                        <span className="text-xs text-ivory/60 mb-2 max-w-[150px] truncate text-center">
                          "{uniqueChord.firstLyric}"
                        </span>
                      )}
                      
                      <div className="flex flex-col items-center gap-1 text-[10px] text-ivory/40">
                        <span className="text-gold font-medium">{uniqueChord.firstTime}</span>
                        <span className="text-ivory/30">{uniqueChord.firstSection}</span>
                      </div>
                      
                      {/* Show all timestamps for this chord */}
                      {uniqueChord.occurrences.length > 1 && (
                        <div className="mt-2 pt-2 border-t border-silver/10 w-full">
                          <span className="text-[8px] text-ivory/30 block text-center mb-1">All timestamps:</span>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {uniqueChord.occurrences.slice(0, 8).map((occ, i) => (
                              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-charcoal-light/50 text-ivory/50">
                                {occ.time}
                              </span>
                            ))}
                            {uniqueChord.occurrences.length > 8 && (
                              <span className="text-[8px] text-ivory/30">+{uniqueChord.occurrences.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
            
            {/* Current position indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-silver z-20"
              style={{ left: `${(currentTime / 100) * totalWidth + 20}px` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-silver" />
            </div>
          </div>
        </div>
        
        {/* Footer with Strumming Pattern */}
        <div className="p-4 border-t border-silver/10 bg-charcoal-light/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-ivory/60">
              <span>{songData?.title}</span>
              <span className="text-ivory/40">•</span>
              <span>{showAllChords ? `${chordTimeline.length} chords` : `${uniqueChords.length} unique`}</span>
            </div>
            
            {/* Current Strumming Pattern */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30">
              <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              <span className="text-xs text-gold font-medium">{currentStrumming}</span>
            </div>
            
            <span className="text-ivory/60 text-sm">
              {songData?.artist}
            </span>
          </div>
        </div>
      </div>

      {/* Chord Popup */}
      <AnimatePresence>
        {showPopup && (
          <ChordPopup 
            chord={selectedChord} 
            isOpen={showPopup} 
            onClose={() => setShowPopup(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}
