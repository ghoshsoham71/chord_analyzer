import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Song sections with their default levels
const SONG_SECTIONS = [
  { id: "intro", name: "Intro", color: "#C89B3C" },
  { id: "verse1", name: "Verse 1", color: "#C89B3C" },
  { id: "prechorus", name: "Pre-Chorus", color: "#C89B3C" },
  { id: "chorus", name: "Chorus", color: "#C89B3C" },
  { id: "verse2", name: "Verse 2", color: "#C89B3C" },
  { id: "bridge", name: "Bridge", color: "#C89B3C" },
  { id: "outro", name: "Outro", color: "#C89B3C" },
]

export default function MixingConsole({ file }) {
  const [levels, setLevels] = useState(() => {
    const initial = {}
    SONG_SECTIONS.forEach((section) => {
      initial[section.id] = 70
    })
    return initial
  })
  const [masterLevel, setMasterLevel] = useState(80)
  const [activeSection, setActiveSection] = useState(null)

  const handleLevelChange = (sectionId, value) => {
    setLevels((prev) => ({
      ...prev,
      [sectionId]: parseInt(value),
    }))
  }

  const handleMasterChange = (value) => {
    setMasterLevel(parseInt(value))
  }

  // Get level color based on value
  const getLevelColor = (level) => {
    if (level > 85) return "text-red-400"
    if (level > 70) return "text-gold"
    return "text-emerald-400"
  }

  // Get gradient based on level
  const getLevelGradient = (level) => {
    if (level > 85) return "from-red-500 via-red-400 to-red-600"
    if (level > 70) return "from-gold via-amber-400 to-gold"
    return "from-emerald-500 via-emerald-400 to-emerald-600"
  }

  if (!file) {
    return null
  }

  return (
    <div className="w-full">
      {/* Main Container */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold gradient-text">Section Mixer</h3>
              <p className="text-ivory/50 text-sm">Fine-tune each part of your track</p>
            </div>
            
            {/* Animated VU Meter */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-charcoal-light/50 border border-gold/10">
              <div className="flex gap-[3px] h-10 items-end">
                {[...Array(14)].map((_, i) => {
                  const threshold = (i + 1) * 7.14
                  const isActive = masterLevel >= threshold
                  const isHigh = i >= 10
                  const isMid = i >= 6
                  
                  return (
                    <motion.div
                      key={i}
                      className={`w-1.5 rounded-sm ${
                        isHigh 
                          ? isActive 
                            ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' 
                            : 'bg-red-500/20'
                          : isMid 
                          ? isActive 
                            ? 'bg-gold shadow-[0_0_10px_rgba(200,155,60,0.8)]' 
                            : 'bg-gold/30'
                          : isActive 
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
                            : 'bg-emerald-400/20'
                      }`}
                      style={{ height: `${(i + 1) * 6.5}px` }}
                      animate={isActive ? { scaleY: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3, repeat: 0 }}
                    />
                  )
                })}
              </div>
              
              <div className="text-right">
                <span className="text-xs text-ivory/40 uppercase tracking-wider">Master</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${getLevelColor(masterLevel)}`}>
                    {masterLevel}
                  </span>
                  <span className="text-ivory/30 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Sliders - Horizontal Layout */}
        <div className="p-6">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
            {SONG_SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex-shrink-0 w-32 p-4 rounded-xl border transition-all duration-300
                  ${activeSection === section.id 
                    ? 'bg-gold/20 border-gold shadow-gold-glow' 
                    : 'bg-charcoal-light/30 border-gold/20 hover:border-gold/40'
                  }
                `}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
              >
                {/* Section Label */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-ivory/70 uppercase tracking-wide">{section.name}</span>
                  <span className={`text-lg font-bold ${getLevelColor(levels[section.id])}`}>
                    {levels[section.id]}
                  </span>
                </div>

                {/* Vertical Level Slider */}
                <div className="relative h-28 w-6 mx-auto">
                  {/* Background Track */}
                  <div className="absolute inset-0 bg-charcoal-light/60 rounded-full overflow-hidden">
                    {/* Gradient Fill */}
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getLevelGradient(levels[section.id])}`}
                      initial={{ height: "0%" }}
                      animate={{ height: `${levels[section.id]}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    
                    {/* Glow Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-[2px] bg-white/50 shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                      style={{ bottom: `calc(${levels[section.id]}% - 1px)` }}
                    />
                  </div>
                  
                  {/* Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={levels[section.id]}
                    onChange={(e) => handleLevelChange(section.id, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" }}
                  />
                </div>

                {/* Scale */}
                <div className="flex justify-between mt-2 text-[9px] text-ivory/30">
                  <span>100</span>
                  <span>0</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Master Level - Full Width */}
        <div className="px-6 pb-6">
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-charcoal-light/60 via-charcoal-light/40 to-charcoal-light/60 border border-gold/20">
            {/* Top Line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            <div className="flex items-center gap-6">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-brick/20 border border-gold/30 flex items-center justify-center shadow-inner">
                <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              
              {/* Label */}
              <div className="w-24">
                <h4 className="text-base font-semibold text-ivory">Master</h4>
                <p className="text-ivory/40 text-xs">Output level</p>
              </div>
              
              {/* Slider */}
              <div className="flex-1">
                <div className="relative h-5 bg-charcoal-light/80 rounded-full overflow-hidden border border-gold/10">
                  {/* Track Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 via-gold/40 to-red-500/40" />
                  
                  {/* Active Fill */}
                  <motion.div
                    className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${getLevelGradient(masterLevel)}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${masterLevel}%` }}
                  />
                  
                  {/* Thumb */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-white via-gold to-amber-600 shadow-lg border-2 border-white/20"
                    style={{ left: `calc(${masterLevel}% - 10px)` }}
                  >
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gold to-brick" />
                  </motion.div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterLevel}
                    onChange={(e) => handleMasterChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                {/* Scale */}
                <div className="flex justify-between mt-2 text-xs text-ivory/30">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
              
              {/* Level Display */}
              <div className="w-20 text-right">
                <div className={`text-4xl font-bold ${getLevelColor(masterLevel)}`}>
                  {masterLevel}
                </div>
                <span className="text-ivory/40 text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="px-6 pb-6">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,155,60,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold via-amber-500 to-brick text-ivory font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Mixed Audio
          </motion.button>
        </div>
      </div>
    </div>
  )
}
