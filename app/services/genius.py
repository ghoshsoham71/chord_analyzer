import os
import re
import lyricsgenius
from typing import Optional
from app.schemas import LyricsData


class GeniusService:
    """Service for fetching lyrics from Genius API"""
    
    def __init__(self):
        self.access_token = os.getenv("GENIUS_ACCESS_TOKEN")
        
        if not self.access_token:
            raise ValueError("Genius access token not found in environment")
        
        self.genius = lyricsgenius.Genius(
            self.access_token,
            skip_non_songs=True,
            excluded_terms=["(Remix)", "(Live)"],
            remove_section_headers=False,
            verbose=False
        )
    
    def clean_lyrics(self, lyrics: str) -> str:
        """Clean and format lyrics"""
        # Remove embed footer
        lyrics = re.sub(r'\d+Embed$', '', lyrics)
        
        # Remove extra whitespace
        lyrics = re.sub(r'\n{3,}', '\n\n', lyrics)
        
        # Strip leading/trailing whitespace
        lyrics = lyrics.strip()
        
        return lyrics
    
    def search_lyrics(self, title: str, artist: str) -> Optional[LyricsData]:
        """Search for song lyrics on Genius"""
        try:
            # Search for the song
            song = self.genius.search_song(title, artist)
            
            if not song:
                return None
            
            # Clean the lyrics
            cleaned_lyrics = self.clean_lyrics(song.lyrics)
            
            return LyricsData(
                lyrics=cleaned_lyrics,
                source="genius"
            )
        
        except Exception as e:
            print(f"Error fetching lyrics: {e}")
            return None
    
    def get_lyrics_lines(self, lyrics: str) -> list[str]:
        """Split lyrics into lines, preserving section headers"""
        lines = []
        for line in lyrics.split('\n'):
            line = line.strip()
            if line:
                lines.append(line)
        return lines