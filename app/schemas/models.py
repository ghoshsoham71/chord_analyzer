from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List


class AnalyzeRequest(BaseModel):
    """Request model for song analysis"""
    spotify_url: str = Field(..., description="Spotify track URL")
    transpose: int = Field(default=0, ge=-11, le=11, description="Semitones to transpose (-11 to +11)")

    class Config:
        json_schema_extra = {
            "example": {
                "spotify_url": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
                "transpose": 2
            }
        }


class SongInfo(BaseModel):
    """Song metadata"""
    title: str
    artist: str
    album: Optional[str] = None
    duration_ms: int
    spotify_id: str
    preview_url: Optional[str] = None
    key: Optional[str] = None
    tempo: Optional[float] = None
    time_signature: Optional[int] = None


class LyricsData(BaseModel):
    """Lyrics information"""
    lyrics: str
    source: str = "genius"


class ChordProgression(BaseModel):
    """Chord progression for a section"""
    section: str = Field(..., description="Song section (verse, chorus, etc.)")
    chords: List[str] = Field(..., description="List of chords in order")
    timing: Optional[str] = None


class AudioAnalysis(BaseModel):
    """Audio analysis results"""
    key: str
    tempo: float
    time_signature: int
    chord_progressions: List[ChordProgression]
    structure: Optional[str] = None


class ChordLine(BaseModel):
    """A line of lyrics with chords"""
    lyrics_line: str
    chords: List[tuple[int, str]] = Field(
        ..., 
        description="List of (position, chord) tuples"
    )


class ChordSheet(BaseModel):
    """Complete chord sheet"""
    song_info: SongInfo
    key: str
    tempo: float
    capo: Optional[int] = None
    lines: List[ChordLine]


class AnalyzeResponse(BaseModel):
    """Response model for analysis"""
    status: str
    task_id: str
    pdf_url: str
    song_info: SongInfo
    analysis: Optional[AudioAnalysis] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "task_id": "abc123",
                "pdf_url": "/download/abc123",
                "song_info": {
                    "title": "Wonderwall",
                    "artist": "Oasis",
                    "album": "(What's the Story) Morning Glory?",
                    "duration_ms": 258000,
                    "spotify_id": "3n3Ppam7vgaVa1iaRUc9Lp",
                    "key": "F# Minor",
                    "tempo": 87.5
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response model"""
    status: str = "error"
    message: str
    detail: Optional[str] = None