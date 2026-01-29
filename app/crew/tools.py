import os
import json
from typing import Type, Optional
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from app.services import SpotifyService, GeniusService
from app.utils import AudioUtils
from app.schemas import SongInfo, LyricsData
import litellm


class SpotifyInfoInput(BaseModel):
    """Input schema for Spotify info tool"""
    spotify_url: str = Field(..., description="Spotify track URL")


class SpotifyInfoTool(BaseTool):
    name: str = "Get Spotify Track Info"
    description: str = "Fetches track metadata from Spotify including title, artist, key, tempo, and preview URL"
    args_schema: Type[BaseModel] = SpotifyInfoInput
    
    def _run(self, spotify_url: str) -> str:
        service = SpotifyService()
        info = service.get_track_info(spotify_url)
        return json.dumps(info.model_dump(), indent=2)


class LyricsFetchInput(BaseModel):
    """Input schema for lyrics fetch tool"""
    title: str = Field(..., description="Song title")
    artist: str = Field(..., description="Artist name")


class LyricsFetchTool(BaseTool):
    name: str = "Fetch Song Lyrics"
    description: str = "Fetches song lyrics from Genius API given title and artist"
    args_schema: Type[BaseModel] = LyricsFetchInput
    
    def _run(self, title: str, artist: str) -> str:
        service = GeniusService()
        lyrics_data = service.search_lyrics(title, artist)
        
        if not lyrics_data:
            return json.dumps({"error": "Lyrics not found"})
        
        return json.dumps(lyrics_data.model_dump(), indent=2)


class AudioAnalysisInput(BaseModel):
    """Input schema for audio analysis tool"""
    audio_file_path: str = Field(..., description="Path to audio file (MP3 or WAV)")
    song_title: str = Field(..., description="Title of the song")
    artist: str = Field(..., description="Artist name")


class AudioChordAnalysisTool(BaseTool):
    name: str = "Analyze Audio for Chords"
    description: str = "Uses multimodal LLM to analyze audio file and extract chord progressions throughout the song"
    args_schema: Type[BaseModel] = AudioAnalysisInput
    
    def _run(self, audio_file_path: str, song_title: str, artist: str) -> str:
        """Analyze audio using LiteLLM with multimodal support"""
        
        try:
            # Convert to WAV if needed
            if audio_file_path.endswith('.mp3'):
                wav_path = audio_file_path.replace('.mp3', '.wav')
                AudioUtils.convert_to_wav(audio_file_path, wav_path)
                audio_file_path = wav_path
            
            # Encode audio to base64
            audio_base64 = AudioUtils.encode_audio_to_base64(audio_file_path)
            
            # Get model from environment
            model = os.getenv("AUDIO_ANALYSIS_MODEL", "gpt-4o-audio-preview")
            
            # Prepare prompt for chord analysis
            prompt = f"""Analyze this audio file for "{song_title}" by {artist} and extract the chord progressions.

Please provide:
1. The main key of the song
2. Tempo (BPM)
3. Time signature
4. Chord progressions for each section (verse, chorus, bridge, etc.)
5. Timing information for chord changes

Format the response as JSON with this structure:
{{
  "key": "C Major",
  "tempo": 120,
  "time_signature": 4,
  "chord_progressions": [
    {{
      "section": "Verse 1",
      "chords": ["C", "G", "Am", "F"],
      "timing": "Each chord for 1 bar"
    }},
    {{
      "section": "Chorus",
      "chords": ["F", "G", "C", "Am"],
      "timing": "Each chord for 1 bar"
    }}
  ],
  "structure": "Verse-Chorus-Verse-Chorus-Bridge-Chorus"
}}

Be precise and accurate. Listen carefully to identify all chord changes."""
            
            # Make LiteLLM call with audio
            response = litellm.completion(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "input_audio",
                                "input_audio": {
                                    "data": audio_base64,
                                    "format": "wav"
                                }
                            }
                        ]
                    }
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            # Extract response
            analysis = response.choices[0].message.content
            
            # Validate JSON
            json.loads(analysis)  # Will raise if invalid
            
            return analysis
            
        except Exception as e:
            return json.dumps({
                "error": f"Audio analysis failed: {str(e)}",
                "key": "Unknown",
                "tempo": 0,
                "time_signature": 4,
                "chord_progressions": []
            })


class ChordTransposeInput(BaseModel):
    """Input schema for chord transposition"""
    chord: str = Field(..., description="Chord to transpose (e.g., 'C', 'Am', 'G7')")
    semitones: int = Field(..., description="Number of semitones to transpose (-11 to +11)")


class ChordTransposeTool(BaseTool):
    name: str = "Transpose Chord"
    description: str = "Transposes a single chord by specified semitones"
    args_schema: Type[BaseModel] = ChordTransposeInput
    
    def _run(self, chord: str, semitones: int) -> str:
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        flat_to_sharp = {'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'}
        
        # Extract root note
        root = chord[0]
        if len(chord) > 1 and chord[1] in ['#', 'b']:
            root = chord[:2]
        
        # Convert flats to sharps
        if root in flat_to_sharp:
            root = flat_to_sharp[root]
        
        # Find index and transpose
        if root in notes:
            idx = notes.index(root)
            new_idx = (idx + semitones) % 12
            new_root = notes[new_idx]
            
            # Replace root in chord
            transposed = chord.replace(root, new_root, 1)
            return transposed
        
        return chord


class LyricsChordMapperInput(BaseModel):
    """Input schema for mapping chords to lyrics"""
    lyrics: str = Field(..., description="Full song lyrics")
    chord_progressions: str = Field(..., description="JSON string of chord progressions")


class LyricsChordMapperTool(BaseTool):
    name: str = "Map Chords to Lyrics"
    description: str = "Uses LLM to intelligently map chord progressions to specific positions in lyrics"
    args_schema: Type[BaseModel] = LyricsChordMapperInput
    
    def _run(self, lyrics: str, chord_progressions: str) -> str:
        """Use LLM to map chords to lyrics positions"""
        
        model = os.getenv("TEXT_ANALYSIS_MODEL", "gpt-4o-mini")
        
        prompt = f"""Given these lyrics and chord progressions, map each chord to its exact position in the lyrics.

LYRICS:
{lyrics}

CHORD PROGRESSIONS:
{chord_progressions}

Map each chord to the word/syllable position where it should be played. Return a JSON array where each element represents a line of lyrics with chord positions:

{{
  "lines": [
    {{
      "lyrics_line": "When I find myself in times of trouble",
      "chords": [[0, "C"], [15, "G"], [28, "Am"]]
    }},
    {{
      "lyrics_line": "Mother Mary comes to me",
      "chords": [[0, "F"], [14, "C"]]
    }}
  ]
}}

Each chord is [position_in_line, "chord_name"]. Position 0 is the start of the line.
Be accurate and place chords where they naturally fall in the song structure."""
        
        try:
            response = litellm.completion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            json.loads(result)  # Validate
            
            return result
            
        except Exception as e:
            return json.dumps({
                "error": f"Chord mapping failed: {str(e)}",
                "lines": []
            })