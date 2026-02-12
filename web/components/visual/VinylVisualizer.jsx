import { motion } from "framer-motion"

export default function VinylVisualizer() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gold/10 blur-2xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <motion.div 
        className="absolute inset-0 rounded-full bg-brick/10 blur-xl"
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      {/* Main vinyl record */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-charcoal overflow-hidden shadow-2xl"
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-0 vinyl-grooves" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        
        {/* Label area */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-gold to-brick flex items-center justify-center shadow-inner"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-charcoal" />
          {/* Label text */}
          <span className="absolute -bottom-6 text-[6px] md:text-[7px] text-gold/60 font-display uppercase tracking-widest">
            Chord Analyzer
          </span>
        </motion.div>
        
        {/* Reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      </motion.div>

      {/* Tone arm */}
      <motion.div
        className="absolute -top-2 -right-4 md:-right-8 w-24 md:w-32 h-4 origin-right"
        initial={{ rotate: 35 }}
        animate={{ rotate: [35, 40, 35] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <div className="relative w-full h-full">
          {/* Arm weight */}
          <motion.div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-charcoal-light border-2 border-gold/50 shadow-lg"
            animate={{ 
              boxShadow: ['0 0 10px rgba(200, 155, 60, 0.3)', '0 0 20px rgba(200, 155, 60, 0.5)', '0 0 10px rgba(200, 155, 60, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Arm */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 md:w-24 h-2 bg-gradient-to-r from-charcoal-light to-charcoal border border-gold/30 rounded-r-full" />
        </div>
      </motion.div>

      {/* Playing indicator */}
      <motion.div
        className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-8 md:h-10 bg-gold rounded-full"
            animate={{ 
              scaleY: [0.3, 1, 0.3],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Decorative text */}
      <motion.p
        className="absolute -bottom-20 md:-bottom-24 text-xs text-ivory/40 font-display tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Now Playing
      </motion.p>
    </div>
  )
}
