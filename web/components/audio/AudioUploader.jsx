import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AudioUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      processFile(file)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file) => {
    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    // Get audio duration
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.src = url
    
    audio.onloadedmetadata = async () => {
      const duration = Math.round(audio.duration)
      URL.revokeObjectURL(url)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 150)

      // Call the upload callback with file and duration
      onUpload({
        file,
        duration,
        analysis: null
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setIsUploading(false)
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      // Use default duration
      onUpload({
        file,
        duration: 180,
        analysis: null
      })
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        relative w-full max-w-lg mx-auto p-8 md:p-12 rounded-3xl 
        border-2 border-dashed cursor-pointer overflow-hidden
        transition-all duration-500 ease-out
        ${isDragging 
          ? 'border-gold bg-gold/10 scale-[1.02] shadow-gold-glow-lg' 
          : 'border-gold/20 hover:border-gold/50 bg-charcoal-light/20 hover:bg-charcoal-light/30'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent"
          animate={{ opacity: isHovered ? 1 : 0.5 }}
        />
        {isDragging && (
          <motion.div
            className="absolute inset-0 bg-gold/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Icon */}
        <motion.div 
          className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
            transition-all duration-500
            ${isDragging 
              ? 'bg-gold text-charcoal shadow-gold-glow-lg' 
              : 'bg-gold/10 text-gold'
            }
          `}
          animate={{ 
            scale: isDragging ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gold/30"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          
          <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </motion.div>
        
        {/* Text Content */}
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-3">
              <motion.p 
                className="text-lg md:text-xl font-display font-semibold text-gold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Analyzing audio...
              </motion.p>
              
              {/* Progress bar */}
              <div className="w-48 h-2 bg-charcoal-light/50 rounded-full overflow-hidden mx-auto">
                <motion.div 
                  className="h-full bg-gradient-to-r from-gold to-brick"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-ivory/50">{uploadProgress}% complete</p>
            </div>
          ) : (
            <>
              <motion.p 
                className="text-lg md:text-xl font-display font-semibold text-ivory mb-2"
                key={isDragging ? 'dragging' : 'normal'}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                {isDragging ? 'Release to upload' : 'Drag & drop your audio'}
              </motion.p>
              <p className="text-sm md:text-base text-ivory/50 font-body">
                or click to browse • MP3, WAV, FLAC supported
              </p>
            </>
          )}
        </div>

        {/* File Name Display */}
        <AnimatePresence>
          {fileName && !isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="flex items-center gap-3 px-6 py-3 bg-gold/10 rounded-full border border-gold/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </motion.div>
              <span className="text-sm md:text-base text-gold font-medium truncate max-w-[200px] md:max-w-none">
                {fileName}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/20 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/20 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/20 rounded-br-3xl" />
    </motion.div>
  )
}
