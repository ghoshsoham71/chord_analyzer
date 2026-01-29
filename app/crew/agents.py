import os
from crewai import Agent
from app.crew.tools import (
    SpotifyInfoTool,
    LyricsFetchTool,
    AudioChordAnalysisTool,
    ChordTransposeTool,
    LyricsChordMapperTool
)
import litellm


def get_llm():
    """Get LLM instance via LiteLLM"""
    model = os.getenv("TEXT_ANALYSIS_MODEL", "gpt-4o-mini")
    # LiteLLM automatically handles model routing
    return model


class MusicAgents:
    """Factory class for creating specialized music analysis agents"""
    
    @staticmethod
    def metadata_agent():
        """Agent responsible for fetching song metadata"""
        return Agent(
            role="Music Metadata Specialist",
            goal="Retrieve comprehensive metadata about songs from Spotify",
            backstory="""You are an expert at extracting and organizing music metadata.
            You work with Spotify's API to get accurate information about tracks including
            title, artist, album, key, tempo, and preview URLs. You ensure all data is 
            properly formatted and complete.""",
            tools=[SpotifyInfoTool()],
            verbose=True,
            llm=get_llm()
        )
    
    @staticmethod
    def lyrics_agent():
        """Agent responsible for fetching lyrics"""
        return Agent(
            role="Lyrics Researcher",
            goal="Find and retrieve accurate song lyrics from Genius",
            backstory="""You specialize in finding song lyrics from the Genius platform.
            You're skilled at matching songs with their correct lyrics, handling variations
            in artist names and song titles. You clean and format lyrics to remove 
            unnecessary metadata while preserving section headers like [Verse], [Chorus], etc.""",
            tools=[LyricsFetchTool()],
            verbose=True,
            llm=get_llm()
        )
    
    @staticmethod
    def audio_analyst_agent():
        """Agent responsible for audio analysis using multimodal LLM"""
        return Agent(
            role="Audio Analysis Expert",
            goal="Analyze audio files to extract chord progressions, key, and tempo",
            backstory="""You are a highly skilled music theorist and audio analyst.
            You use advanced multimodal AI to listen to songs and identify:
            - Musical key and mode
            - Tempo (BPM)
            - Time signature
            - Chord progressions throughout the song
            - Song structure (verse, chorus, bridge, etc.)
            
            You have perfect pitch and can accurately transcribe complex chord progressions.
            You pay attention to chord voicings, inversions, and subtle harmonic movements.""",
            tools=[AudioChordAnalysisTool()],
            verbose=True,
            llm=get_llm(),
            max_iter=3  # Allow retries for better accuracy
        )
    
    @staticmethod
    def chord_mapper_agent():
        """Agent responsible for mapping chords to lyrics"""
        return Agent(
            role="Chord Sheet Creator",
            goal="Create accurate chord sheets by mapping chords to lyrics positions",
            backstory="""You are a professional music transcriber who creates chord sheets
            for musicians. You understand song structure, phrasing, and how chords align
            with lyrics. You place chords at the exact positions where they should be played,
            considering syllable stress, phrase boundaries, and musical flow.
            
            You create clean, readable chord sheets that musicians can easily follow.""",
            tools=[LyricsChordMapperTool(), ChordTransposeTool()],
            verbose=True,
            llm=get_llm()
        )
    
    @staticmethod
    def quality_control_agent():
        """Agent for reviewing and validating the final output"""
        return Agent(
            role="Music Quality Controller",
            goal="Review and validate chord sheets for accuracy and completeness",
            backstory="""You are a meticulous music editor who ensures chord sheets are
            accurate, complete, and professionally formatted. You check for:
            - Correct chord spellings and notation
            - Proper alignment of chords with lyrics
            - Consistent formatting throughout
            - No missing sections or chords
            - Accurate key and tempo information
            
            You have high standards and won't approve work that doesn't meet professional quality.""",
            verbose=True,
            llm=get_llm()
        )