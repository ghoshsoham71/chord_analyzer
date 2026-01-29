from crewai import Task
from app.crew.agents import MusicAgents


class MusicTasks:
    """Factory class for creating music analysis tasks"""
    
    @staticmethod
    def fetch_metadata_task(spotify_url: str, agent):
        """Task to fetch song metadata from Spotify"""
        return Task(
            description=f"""Fetch complete metadata for the song at: {spotify_url}
            
            Use the Spotify Info Tool to retrieve:
            1. Song title
            2. Artist name
            3. Album name
            4. Duration
            5. Key and mode
            6. Tempo (BPM)
            7. Time signature
            8. Preview URL (30-second clip)
            
            Ensure all data is accurate and properly formatted.""",
            expected_output="""JSON object containing complete song metadata including:
            - title
            - artist
            - album
            - duration_ms
            - spotify_id
            - preview_url
            - key
            - tempo
            - time_signature""",
            agent=agent
        )
    
    @staticmethod
    def fetch_lyrics_task(song_title: str, artist: str, agent):
        """Task to fetch song lyrics"""
        return Task(
            description=f"""Find and retrieve lyrics for "{song_title}" by {artist}
            
            Use the Lyrics Fetch Tool to:
            1. Search for the song on Genius
            2. Retrieve the full lyrics
            3. Ensure section headers ([Verse], [Chorus], etc.) are preserved
            4. Clean any unnecessary metadata
            
            The lyrics should be complete and accurate.""",
            expected_output="""JSON object containing:
            - lyrics: Complete song lyrics with section headers
            - source: "genius"
            
            Lyrics should maintain original structure with section markers.""",
            agent=agent
        )
    
    @staticmethod
    def analyze_audio_task(audio_path: str, song_title: str, artist: str, agent):
        """Task to analyze audio and extract chords"""
        return Task(
            description=f"""Analyze the audio file at {audio_path} for "{song_title}" by {artist}
            
            Use the Audio Chord Analysis Tool to:
            1. Listen to the entire audio clip
            2. Identify the musical key
            3. Determine the tempo (BPM)
            4. Identify the time signature
            5. Extract chord progressions for each section
            6. Note the timing of chord changes
            7. Identify the song structure
            
            Be thorough and accurate. This is critical for musicians who will use this information.
            Pay attention to:
            - Major vs minor chords
            - Seventh chords, suspended chords, etc.
            - Chord inversions if relevant
            - Section transitions""",
            expected_output="""JSON object containing:
            - key: The musical key (e.g., "C Major", "A Minor")
            - tempo: BPM as a number
            - time_signature: Time signature (usually 4)
            - chord_progressions: Array of objects with:
              - section: Section name (e.g., "Verse 1", "Chorus")
              - chords: Array of chord names
              - timing: Description of chord timing
            - structure: Overall song structure
            
            All chord names should use standard notation (C, Am, F, G7, etc.)""",
            agent=agent
        )
    
    @staticmethod
    def map_chords_to_lyrics_task(lyrics: str, chord_data: str, transpose: int, agent):
        """Task to map chords to lyrics positions"""
        transpose_info = ""
        if transpose != 0:
            transpose_info = f"\n\nIMPORTANT: Transpose all chords by {transpose} semitones ({'up' if transpose > 0 else 'down'})."
        
        return Task(
            description=f"""Create a complete chord sheet by mapping the chord progressions to the lyrics.
            
            LYRICS:
            {lyrics}
            
            CHORD PROGRESSIONS:
            {chord_data}
            {transpose_info}
            
            Use the Lyrics Chord Mapper Tool to:
            1. Analyze the song structure
            2. Match chord progressions to corresponding lyric sections
            3. Place each chord at the correct position in the lyrics
            4. Handle repeated sections (verses, choruses) appropriately
            5. Ensure chords align with syllables where they're played
            
            Create a professional, easy-to-read chord sheet that musicians can follow.""",
            expected_output="""JSON object with:
            - lines: Array of objects containing:
              - lyrics_line: The line of lyrics
              - chords: Array of [position, chord_name] tuples
            
            Each chord should be positioned where it's played in the song.
            Include ALL lyrics lines, even those without chords.
            Section headers should be preserved as separate lines.""",
            agent=agent
        )
    
    @staticmethod
    def quality_review_task(chord_sheet_data: str, agent):
        """Task to review and validate the chord sheet"""
        return Task(
            description=f"""Review this chord sheet for quality and accuracy:
            
            {chord_sheet_data}
            
            Check for:
            1. All sections are present (verses, choruses, bridge, etc.)
            2. Chords are properly positioned
            3. Chord notation is correct and consistent
            4. No missing lyrics or chords
            5. Professional formatting
            6. Transposition is applied correctly (if applicable)
            
            If issues are found, document them clearly.
            If everything is correct, approve the chord sheet.""",
            expected_output="""A brief report stating either:
            - "APPROVED: Chord sheet is accurate and complete"
            OR
            - List of specific issues found that need correction
            
            Be thorough but concise.""",
            agent=agent
        )