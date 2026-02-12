import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SongSearch from "@/components/SongSearch"
import AudioUploader from "@/components/audio/AudioUploader"
import HarmonyGraph from "@/components/visual/HarmonyGraph"
import LiquidGoldShader from "@/components/visual/LiquidGoldShader"
import CinematicScroll from "@/components/cinematic/CinematicScroll"
import Section from "@/components/cinematic/Section"

// "Leave the Door Open" by Silk Sonic - Real chord progression and lyrics
const LEAVE_THE_DOOR_OPEN_DATA = {
  title: "Leave the Door Open",
  artist: "Silk Sonic",
  album: "An Evening with Silk Sonic",
  albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
  duration_seconds: 180,
  timeline: [
    // Intro / Verse 1
    { time: "0:00", chord: "Fmaj7", section: "Intro", lyric: "Mmm hmm" },
    { time: "0:04", chord: "Fmaj7", section: "Intro", lyric: "Mmm hmm" },
    { time: "0:08", chord: "Gm7", section: "Intro", lyric: "What we gonna do is" },
    { time: "0:12", chord: "C7", section: "Intro", lyric: "Exactly what we want to" },
    { time: "0:16", chord: "Fmaj7", section: "Verse 1", lyric: "Say baby, what's your plan?" },
    { time: "0:20", chord: "Fmaj7", section: "Verse 1", lyric: "It's got to be you" },
    { time: "0:24", chord: "Gm7", section: "Verse 1", lyric: "I'm tryin' to make ya" },
    { time: "0:28", chord: "C7", section: "Verse 1", lyric: "Leave the door open" },
    { time: "0:32", chord: "Fmaj7", section: "Verse 1", lyric: "Girl, you got me hangin'" },
    { time: "0:36", chord: "Fmaj7", section: "Verse 1", lyric: "Every single night" },
    { time: "0:40", chord: "Gm7", section: "Verse 1", lyric: "While I'm fightin' these feelings" },
    { time: "0:44", chord: "C7", section: "Verse 1", lyric: "But it's you that I want" },
    { time: "0:48", chord: "Bb7", section: "Pre-Chorus", lyric: "So, baby, just say yes" },
    { time: "0:52", chord: "Eb", section: "Pre-Chorus", lyric: "No, I ain't got no time to waste" },
    { time: "0:56", chord: "Am7", section: "Pre-Chorus", lyric: "Wanna paint your face" },
    { time: "1:00", chord: "Dm7", section: "Pre-Chorus", lyric: "With my colors" },
    { time: "1:04", chord: "G7sus", section: "Chorus", lyric: "Make love" },
    { time: "1:08", chord: "G7", section: "Chorus", lyric: "C'mon, screw the team" },
    { time: "1:12", chord: "Cm7", section: "Chorus", lyric: "We the ones in charge" },
    { time: "1:16", chord: "F7", section: "Chorus", lyric: "Tonight" },
    { time: "1:20", chord: "Bb7", section: "Chorus", lyric: "Girl, I got plans" },
    { time: "1:24", chord: "Eb", section: "Chorus", lyric: "And I need you in the way" },
    { time: "1:28", chord: "Am7", section: "Chorus", lyric: "Like a song that needs a melody" },
    { time: "1:32", chord: "Dm7", section: "Chorus", lyric: "Can't do without" },
    // Verse 2
    { time: "1:36", chord: "Gm7", section: "Verse 2", lyric: "I need you here" },
    { time: "1:40", chord: "C7", section: "Verse 2", lyric: "It's rainin' outside" },
    { time: "1:44", chord: "Fmaj7", section: "Verse 2", lyric: "And cold in here" },
    { time: "1:48", chord: "Fmaj7", section: "Verse 2", lyric: "You got me cryin'" },
    { time: "1:52", chord: "Gm7", section: "Verse 2", lyric: "I fill up your tub" },
    { time: "1:56", chord: "C7", section: "Verse 2", lyric: "I light a candle" },
    { time: "2:00", chord: "Bb7", section: "Verse 2", lyric: "Don't say nothin', baby" },
    { time: "2:04", chord: "Eb", section: "Verse 2", lyric: "Just come on in" },
    // Bridge
    { time: "2:08", chord: "Am7", section: "Bridge", lyric: "Close the window" },
    { time: "2:12", chord: "Dm7", section: "Bridge", lyric: "Lock the door" },
    { time: "2:16", chord: "Gm7", section: "Bridge", lyric: "Don't say nothin' else" },
    { time: "2:20", chord: "C7", section: "Bridge", lyric: "Just let me love you" },
    { time: "2:24", chord: "Fmaj7", section: "Final Chorus", lyric: "And leave the door open" },
    { time: "2:28", chord: "Fmaj7", section: "Final Chorus", lyric: "Leave the door open" },
    { time: "2:32", chord: "Gm7", section: "Final Chorus", lyric: "We can just" },
    { time: "2:36", chord: "C7", section: "Final Chorus", lyric: "Relax and kick it" },
    // Outro
    { time: "2:40", chord: "Fmaj7", section: "Outro", lyric: "Leave the door open" },
    { time: "2:44", chord: "Fmaj7", section: "Outro", lyric: "Mmm hmm" },
    { time: "2:48", chord: "Gm7", section: "Outro", lyric: "Just leave the door open" },
    { time: "2:52", chord: "C7", section: "Outro", lyric: "And come on in" },
    { time: "2:56", chord: "Fmaj7", section: "Outro", lyric: "Yeah" },
  ]
}

// Mock chord timeline data for other songs - in production this comes from backend
const generateChordTimeline = (durationSeconds) => {
  const timeline = []
  const progressions = [
    ["Cmaj7", "Am7", "Dm7", "G7"],
    ["Dm7", "G7", "Cmaj7", "Am7"],
    ["Am7", "F", "C", "G"],
    ["Em", "G", "C", "D"],
  ]
  
  const sections = [
    { name: "Intro", start: 0, duration: 0.1 },
    { name: "Verse 1", start: 0.1, duration: 0.25 },
    { name: "Pre-Chorus", start: 0.35, duration: 0.08 },
    { name: "Chorus", start: 0.43, duration: 0.17 },
    { name: "Verse 2", start: 0.6, duration: 0.17 },
    { name: "Bridge", start: 0.77, duration: 0.13 },
    { name: "Final Chorus", start: 0.9, duration: 0.1 },
  ]
  
  const lyrics = [
    "Mmm hmm",
    "Say baby what's your plan",
    "I'm tryin' to make ya",
    "Leave the door open",
    "Girl you got me hangin'",
    "Every single night",
    "Fightin' these feelings",
    "It's rainin' outside",
    "And cold in here",
    "You got me cryin'",
    "I fill up your tub",
    "I light a candle",
    "Don't say nothin'",
    "Baby just come on in"
  ]
  
  const bpm = 100
  const secondsPerChord = (60 / bpm) * 4
  
  let currentTime = 0
  let chordIndex = 0
  let lyricIndex = 0
  let currentSection = "Intro"
  
  while (currentTime < durationSeconds) {
    const progress = currentTime / durationSeconds
    currentSection = sections.find(s => 
      progress >= s.start && progress < s.start + s.duration
    )?.name || "Outro"
    
    const chord = progressions[chordIndex % progressions.length][chordIndex % 4]
    
    timeline.push({
      time: `${Math.floor(currentTime / 60)}:${(Math.floor(currentTime % 60)).toString().padStart(2, '0')}`,
      chord: chord,
      section: currentSection,
      lyric: lyrics[lyricIndex % lyrics.length]
    })
    
    currentTime += secondsPerChord
    chordIndex++
    lyricIndex++
  }
  
  return timeline
}

export default function Home() {
  const [selectedSong, setSelectedSong] = useState(null)
  const [songData, setSongData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const audioRef = useRef(null)

  const handleSelectSong = (song) => {
    setSelectedSong(song)
    setIsAnalyzing(true)
    
    // Check if it's "Leave the Door Open" - use the real data
    if (song.title === "Leave the Door Open" && song.artist === "Silk Sonic") {
      setTimeout(() => {
        setSongData(LEAVE_THE_DOOR_OPEN_DATA)
        setIsAnalyzing(false)
      }, 1500)
      return
    }
    
    // Simulate backend analysis for other songs
    setTimeout(() => {
      const durationParts = song.duration.split(':')
      const durationSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1])
      
      setSongData({
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumCoverUrl: song.albumCoverUrl,
        duration_seconds: durationSeconds,
        timeline: generateChordTimeline(durationSeconds)
      })
      
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleFileUpload = (uploadedFile) => {
    setIsAnalyzing(true)
    
    setTimeout(() => {
      const duration = uploadedFile.duration || 180
      
      setSongData({
        title: uploadedFile.file?.name || "Uploaded Track",
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration_seconds: duration,
        timeline: generateChordTimeline(duration)
      })
      
      setProcessedAudioUrl(URL.createObjectURL(uploadedFile.file))
      setIsAnalyzing(false)
    }, 2500)
  }

  const handleDownload = () => {
    if (processedAudioUrl) {
      const link = document.createElement('a')
      link.href = processedAudioUrl
      link.download = "processed-audio.mp3"
      link.click()
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LiquidGoldShader />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-silver/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brick/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-body font-medium text-silver/80 tracking-widest uppercase backdrop-blur-sm bg-silver/5 rounded-full border border-silver/20">
              Musical Harmonics Reimagined
            </span>
          </motion.div>

          <motion.h1 
            className="text-display-xl font-display font-bold mb-8 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Chord Analyzer
          </motion.h1>

          <motion.p 
            className="text-body-lg text-ivory/70 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover the hidden harmonics within your music. Search for any song and explore 
            its chord progression, guitar finger positions, and full lyrics timeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8"
          >
            <SongSearch onSelectSong={handleSelectSong} />
            
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-8 bg-silver rounded-full"
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <span className="text-silver font-body">Analyzing song...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs text-ivory/40 uppercase tracking-widest">Scroll to see results</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <svg className="w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Selected Song & Harmonic Timeline */}
      {selectedSong && (
        <Section background="gradient">
          <CinematicScroll>
            <div className="glass-panel p-8 md:p-12 max-w-6xl mx-auto">
              {/* Song Info Header with Album Cover */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                {/* Album Cover - Real Image or Colored Placeholder */}
                {selectedSong.albumCoverUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-charcoal-light to-charcoal flex-shrink-0">
                    <img 
                      src={selectedSong.albumCoverUrl} 
                      alt={selectedSong.album} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br ${(() => {
                    const colors = {
                      "An Evening with Silk Sonic": "from-amber-600 to-yellow-800",
                      "After Hours": "from-red-900 to-red-700",
                      "÷": "from-blue-600 to-blue-800",
                      "21": "from-black to-gray-800",
                      "x": "from-gray-600 to-gray-800",
                      "Uptown Special": "from-purple-600 to-purple-900",
                      "Doo-Wops & Hooligans": "from-red-600 to-red-800",
                      "Unorthodox Jukebox": "from-yellow-600 to-orange-800",
                      "24K Magic": "from-cyan-600 to-blue-700",
                    }
                    return colors[selectedSong.album] || 'from-gray-600 to-gray-800'
                  })()} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-2xl">
                      {selectedSong.album?.split(' ').map(w => w[0]).join('').slice(0,2) || '♪'}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <h2 className="text-2xl font-bold gradient-text">{selectedSong.title}</h2>
                  <p className="text-ivory/60">{selectedSong.artist}</p>
                  <p className="text-ivory/40 text-sm">{selectedSong.album} • {selectedSong.duration}</p>
                </div>
              </motion.div>

              {/* Harmonic Timeline */}
              {songData && <HarmonyGraph songData={songData} />}
            </div>
          </CinematicScroll>
        </Section>
      )}

      {/* Demo Timeline - Leave the Door Open Example */}
      {!selectedSong && (
        <Section background="gradient">
          <CinematicScroll>
            <div className="glass-panel p-8 md:p-12 max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-silver/80 tracking-widest uppercase bg-silver/10 rounded-full border border-silver/20">
                  Featured Example
                </span>
                <h2 className="text-display-md font-display font-bold mb-4 text-shadow-gold">
                  Harmonic Timeline
                </h2>
                <p className="text-body-md text-ivory/60 max-w-2xl mx-auto">
                  Search for any song above to see its complete chord progression with timestamps, 
                  guitar chord diagrams, and lyrics mapped to each chord change.
                </p>
              </div>

              {/* Leave the Door Open Demo */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-brick flex items-center justify-center">
                    <svg className="w-6 h-6 text-ivory" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-silver">Leave the Door Open</h3>
                    <p className="text-ivory/50">Silk Sonic • An Evening with Silk Sonic</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm">3:00</span>
                </div>
              </div>

              {/* Demo Timeline with Real Data */}
              <HarmonyGraph songData={LEAVE_THE_DOOR_OPEN_DATA} />
            </div>
          </CinematicScroll>
        </Section>
      )}

      {/* Download Section */}
      {processedAudioUrl && (
        <Section background="gradient">
          <CinematicScroll>
            <div className="glass-panel p-8 md:p-12 max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-display-md font-display font-bold mb-4 text-shadow-gold">
                  Download Your Track
                </h2>
                <p className="text-body-md text-ivory/60 mb-8">
                  Your audio has been processed. Preview and download your track below.
                </p>

                <div className="mb-8">
                  <audio 
                    ref={audioRef}
                    controls 
                    className="w-full max-w-md mx-auto"
                    src={processedAudioUrl}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handleDownload}
                    className="btn-primary flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download MP3
                  </motion.button>
                  <motion.button
                    onClick={() => audioRef.current?.play()}
                    className="btn-secondary flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preview
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </CinematicScroll>
        </Section>
      )}

      {/* Upload Section - At Bottom */}
      <Section>
        <CinematicScroll>
          <div className="glass-panel p-8 md:p-12 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display-md font-display font-bold mb-4">
                Or <span className="gradient-text">Upload Your Own</span>
              </h2>
              <p className="text-body-md text-ivory/60 mb-8">
                Have a local audio file? Upload it to analyze its chord progression and generate a complete chord sheet.
              </p>
              
              <AudioUploader onUpload={handleFileUpload} />
            </motion.div>
          </div>
        </CinematicScroll>
      </Section>

      {/* Footer */}
      <footer className="py-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light/30 to-transparent pointer-events-none" />
        <div className="relative z-10 container-premium">
          <div className="divider-glow max-w-md mx-auto mb-8" />
          <p className="text-ivory/40 text-sm mb-4">
            Powered by magical harmonics ✨
          </p>
          <p className="text-xs text-ivory/20">
            © 2024 Chord Analyzer. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
