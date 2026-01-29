import os
import re
from typing import Optional
import httpx
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from app.schemas import SongInfo


class SpotifyService:
    """Service for interacting with Spotify API"""
    
    def __init__(self):
        self.client_id = os.getenv("SPOTIFY_CLIENT_ID")
        self.client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Spotify credentials not found in environment")
        
        auth_manager = SpotifyClientCredentials(
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        self.sp = spotipy.Spotify(auth_manager=auth_manager)
    
    def extract_track_id(self, spotify_url: str) -> str:
        """Extract track ID from Spotify URL"""
        patterns = [
            r'spotify\.com/track/([a-zA-Z0-9]+)',
            r'spotify:track:([a-zA-Z0-9]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, spotify_url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid Spotify URL format")
    
    def get_track_info(self, spotify_url: str) -> SongInfo:
        """Get track information from Spotify"""
        track_id = self.extract_track_id(spotify_url)
        track = self.sp.track(track_id)
        
        if not track:
            raise ValueError("Failed to retrieve track information from Spotify")
        
        # Get audio features for additional info
        features_list = self.sp.audio_features([track_id])
        audio_features = features_list[0] if features_list and features_list[0] else {}
        
        # Convert key number to note
        key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key_note = key_map[audio_features['key']] if audio_features['key'] != -1 else None
        mode = 'Major' if audio_features['mode'] == 1 else 'Minor'
        
        return SongInfo(
            title=track['name'],
            artist=', '.join([artist['name'] for artist in track['artists']]),
            album=track['album']['name'],
            duration_ms=track['duration_ms'],
            spotify_id=track_id,
            preview_url=track.get('preview_url'),
            key=f"{key_note} {mode}" if key_note else None,
            tempo=audio_features['tempo'],
            time_signature=audio_features['time_signature']
        )
    
    async def download_preview(self, preview_url: str, output_path: str) -> bool:
        """Download 30-second preview audio"""
        if not preview_url:
            return False
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(preview_url)
                response.raise_for_status()
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                return True
        except Exception as e:
            print(f"Error downloading preview: {e}")
            return False