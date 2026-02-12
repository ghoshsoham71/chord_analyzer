import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Mock song database for demo (in production this would call the backend)
const MOCK_SONGS = [
  { id: "1", title: "Leave the Door Open", artist: "Silk Sonic", album: "An Evening with Silk Sonic", duration: "3:00", genre: "R&B/Soul", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36" },
  { id: "2", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", genre: "Synthwave", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739477b6c436e5d1d9c3d306c8" },
  { id: "3", title: "Shape of You", artist: "Ed Sheeran", album: "÷", duration: "3:53", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96" },
  { id: "4", title: "Someone Like You", artist: "Adele", album: "21", duration: "4:45", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2730e6529e5e1a86b6fcd84f67" },
  { id: "5", title: "Perfect", artist: "Ed Sheeran", album: "÷", duration: "4:23", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96" },
  { id: "6", title: "Thinking Out Loud", artist: "Ed Sheeran", album: "x", duration: "4:57", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2737c3e32c3d38e93e19ea2233" },
  { id: "7", title: "Uptown Funk", artist: "Bruno Mars", album: "Uptown Special", duration: "4:30", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf" },
  { id: "8", title: "Just the Way You Are", artist: "Bruno Mars", album: "Doo-Wops & Hooligans", duration: "3:40", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d24c31cf0b06b5ad5b476b" },
  { id: "9", title: "Treasure", artist: "Bruno Mars", album: "Unorthodox Jukebox", duration: "2:58", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d2e17e2b1b3c6e7c9e4c6a" },
  { id: "10", title: "Locked Out of Heaven", artist: "Bruno Mars", album: "Unorthodox Jukebox", duration: "3:53", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d2e17e2b1b3c6e7c9e4c6a" },
  { id: "11", title: "When I Was Your Man", artist: "Bruno Mars", album: "Unorthodox Jukebox", duration: "3:33", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d2e17e2b1b3c6e7c9e4c6a" },
  { id: "12", title: "Grenade", artist: "Bruno Mars", album: "Doo-Wops & Hooligans", duration: "3:43", genre: "Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d24c31cf0b06b5ad5b476b" },
  { id: "13", title: "24K Magic", artist: "Bruno Mars", album: "24K Magic", duration: "3:21", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d5e4b72f8e7c5e4b72f8e" },
  { id: "14", title: "That's What I Like", artist: "Bruno Mars", album: "24K Magic", duration: "3:26", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d5e4b72f8e7c5e4b72f8e" },
  { id: "15", title: "Finesse", artist: "Bruno Mars", album: "24K Magic", duration: "3:10", genre: "Funk", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d5e4b72f8e7c5e4b72f8e" },
  { id: "16", title: "Versace on the Floor", artist: "Bruno Mars", album: "24K Magic", duration: "4:21", genre: "R&B", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b2739d5e4b72f8e7c5e4b72f8e" },
  { id: "17", title: "Die a Happy Man", artist: "Thomas Rhett", album: "Tangled Up", duration: "3:47", genre: "Country", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273d4c8c4e8c8e9d0c7e9d0c7" },
  { id: "18", title: "Make You Mine", artist: "Public", album: "Take Time", duration: "3:33", genre: "Indie Pop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273e3e3e3e3e3e3e3e3e3e3e3" },
  { id: "19", title: "Old Town Road", artist: "Lil Nas X", album: "7", duration: "2:37", genre: "Country Rap", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273d5d5d5d5d5d5d5d5d5d5d5" },
  { id: "20", title: "Sunflower", artist: "Post Malone", album: "Spider-Man", duration: "2:38", genre: "Hip Hop", albumCoverUrl: "https://i.scdn.co/image/ab67616d0000b273787f6c6c6c6c6c6c6c6c6c6" },
]

// Popular searches for autofill
const POPULAR_SEARCHES = [
  { title: "Leave the Door Open", artist: "Silk Sonic" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Shape of You", artist: "Ed Sheeran" },
  { title: "Uptown Funk", artist: "Bruno Mars" },
  { title: "Thinking Out Loud", artist: "Ed Sheeran" },
]

export default function SongSearch({ onSelectSong }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [didYouMean, setDidYouMean] = useState(null)
  const [showAutofill, setShowAutofill] = useState(false)
  const [autofillIndex, setAutofillIndex] = useState(-1)
  const inputRef = useRef(null)
  const autofillRef = useRef(null)

  // Get autofill suggestions based on current input
  const getAutofillSuggestions = useCallback((input) => {
    if (!input || input.length < 1) return []
    
    const normalizedInput = input.toLowerCase()
    const suggestions = []
    
    // Check for title matches
    MOCK_SONGS.forEach(song => {
      const titleLower = song.title.toLowerCase()
      if (titleLower.startsWith(normalizedInput)) {
        suggestions.push({
          type: 'title',
          text: song.title,
          subtext: song.artist,
          song
        })
      }
    })
    
    // Check for artist matches
    MOCK_SONGS.forEach(song => {
      const artistLower = song.artist.toLowerCase()
      if (artistLower.startsWith(normalizedInput)) {
        const exists = suggestions.some(s => s.type === 'artist' && s.text === song.artist)
        if (!exists) {
          suggestions.push({
            type: 'artist',
            text: song.artist,
            subtext: `${song.title}`,
            song
          })
        }
      }
    })
    
    // Check for partial matches within title
    MOCK_SONGS.forEach(song => {
      const titleLower = song.title.toLowerCase()
      if (titleLower.includes(normalizedInput) && !titleLower.startsWith(normalizedInput)) {
        const exists = suggestions.some(s => s.song && s.song.id === song.id)
        if (!exists) {
          suggestions.push({
            type: 'title',
            text: song.title,
            subtext: song.artist,
            song
          })
        }
      }
    })
    
    return suggestions.slice(0, 5)
  }, [])

  // Search as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setDidYouMean(null)
      setShowAutofill(false)
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = (searchQuery) => {
    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      const normalizedQuery = searchQuery.toLowerCase()
      
      // Filter songs
      let filtered = MOCK_SONGS.filter(song => 
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery)
      )

      // "Did you mean" logic - find close matches
      if (filtered.length === 0) {
        const similar = MOCK_SONGS.find(song => {
          const titleWords = song.title.toLowerCase().split(" ")
          return titleWords.some(word => 
            word.length > 3 && normalizedQuery.includes(word.substring(0, 3))
          )
        })
        if (similar) {
          setDidYouMean(similar)
        } else {
          setDidYouMean(null)
        }
      } else {
        setDidYouMean(null)
      }

      setResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const handleSelectSong = (song) => {
    setSelectedSong(song)
    setQuery("")
    setResults([])
    setDidYouMean(null)
    setShowAutofill(false)
    onSelectSong(song)
  }

  const handleDidYouMeanClick = () => {
    if (didYouMean) {
      handleSelectSong(didYouMean)
    }
  }

  // Handle keyboard navigation for autofill
  const handleKeyDown = (e) => {
    const suggestions = getAutofillSuggestions(query)
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (showAutofill && suggestions.length > 0) {
        setAutofillIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else {
        setShowAutofill(true)
        setAutofillIndex(0)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showAutofill && suggestions.length > 0) {
        setAutofillIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      }
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (showAutofill && suggestions.length > 0 && autofillIndex >= 0) {
        e.preventDefault()
        const suggestion = suggestions[autofillIndex]
        if (suggestion.song) {
          handleSelectSong(suggestion.song)
        } else {
          // If it's an artist search, search for their songs
          setQuery(suggestion.text + " ")
          setShowAutofill(false)
        }
      }
    } else if (e.key === 'Escape') {
      setShowAutofill(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setAutofillIndex(-1)
    if (value.length > 0) {
      setShowAutofill(true)
    } else {
      setShowAutofill(false)
    }
  }

  // Close autofill when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autofillRef.current && !autofillRef.current.contains(event.target)) {
        setShowAutofill(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const autofillSuggestions = getAutofillSuggestions(query)

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={autofillRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowAutofill(true)}
          placeholder="Search for a song..."
          className="w-full px-6 py-4 pr-12 rounded-2xl bg-charcoal-light/50 border border-gold/20 text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold/50 focus:shadow-gold-glow transition-all"
          autoComplete="off"
        />
        
        {/* Search Icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Autofill Suggestions Dropdown */}
      <AnimatePresence>
        {showAutofill && query.length > 0 && autofillSuggestions.length > 0 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-charcoal-light border border-gold/20 overflow-hidden z-50"
          >
            <div className="px-3 py-2 text-xs text-ivory/40 border-b border-gold/10">
              Press Tab or Enter to select
            </div>
            {autofillSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                onClick={() => {
                  if (suggestion.song) {
                    handleSelectSong(suggestion.song)
                  } else {
                    setQuery(suggestion.text + " ")
                    setShowAutofill(false)
                  }
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gold/10 transition-colors text-left ${
                  index === autofillIndex ? 'bg-gold/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-charcoal-light flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-ivory font-medium">
                    {suggestion.type === 'title' ? (
                      <>
                        <span className="text-gold">{query}</span>
                        {suggestion.text.slice(query.length)}
                      </>
                    ) : (
                      suggestion.text
                    )}
                  </p>
                  <p className="text-ivory/40 text-sm">{suggestion.subtext}</p>
                </div>
                <span className="text-ivory/30 text-xs uppercase">{suggestion.type}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Song Badge */}
      {selectedSong && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-gold/10 border border-gold/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-brick flex items-center justify-center">
              <svg className="w-5 h-5 text-ivory" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <p className="text-ivory font-semibold">{selectedSong.title}</p>
              <p className="text-ivory/50 text-sm">{selectedSong.artist}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSong(null)}
            className="w-8 h-8 rounded-full bg-charcoal-light flex items-center justify-center text-ivory/40 hover:text-ivory transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-charcoal-light border border-gold/20 overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {results.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gold/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-charcoal-light flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-ivory font-medium">{song.title}</p>
                  <p className="text-ivory/40 text-sm">{song.artist}</p>
                </div>
                <div className="text-right">
                  <span className="text-ivory/30 text-xs block">{song.duration}</span>
                  <span className="text-ivory/20 text-[10px]">{song.genre}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Did You Mean */}
      <AnimatePresence>
        {didYouMean && results.length === 0 && query.length >= 2 && !isSearching && !showAutofill && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-charcoal-light border border-gold/20 p-4 z-50"
          >
            <p className="text-ivory/40 text-sm mb-2">No results found. Did you mean?</p>
            <button
              onClick={handleDidYouMeanClick}
              className="w-full px-4 py-3 flex items-center gap-3 rounded-lg hover:bg-gold/10 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-charcoal-light flex items-center justify-center">
                <svg className="w-5 h-5 text-gold/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-ivory font-medium">{didYouMean.title}</p>
                <p className="text-ivory/40 text-sm">{didYouMean.artist}</p>
              </div>
              <span className="text-gold text-xs">Tap to select</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggestions when input is empty */}
      <AnimatePresence>
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-charcoal-light/80 border border-gold/10 p-4 z-40"
          >
            <p className="text-ivory/30 text-xs mb-3 uppercase tracking-wider">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const song = MOCK_SONGS.find(s => s.title === search.title && s.artist === search.artist)
                    if (song) handleSelectSong(song)
                  }}
                  className="px-3 py-1.5 rounded-full bg-charcoal-light border border-gold/20 text-ivory/60 text-sm hover:bg-gold/10 hover:border-gold/40 transition-colors"
                >
                  {search.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
