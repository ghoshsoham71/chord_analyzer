import os
import base64
from typing import Optional
from pydub import AudioSegment


class AudioUtils:
    """Utilities for audio processing"""
    
    @staticmethod
    def convert_to_wav(input_path: str, output_path: str) -> str:
        """Convert audio file to WAV format"""
        try:
            audio = AudioSegment.from_file(input_path)
            audio.export(output_path, format="wav")
            return output_path
        except Exception as e:
            raise Exception(f"Audio conversion failed: {e}")
    
    @staticmethod
    def encode_audio_to_base64(file_path: str) -> str:
        """Encode audio file to base64 string"""
        with open(file_path, 'rb') as audio_file:
            encoded = base64.b64encode(audio_file.read()).decode('utf-8')
        return encoded
    
    @staticmethod
    def get_audio_duration(file_path: str) -> float:
        """Get duration of audio file in seconds"""
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000.0
    
    @staticmethod
    def extract_segment(
        input_path: str, 
        output_path: str, 
        start_ms: int, 
        end_ms: int
    ) -> str:
        """Extract a segment from audio file"""
        audio = AudioSegment.from_file(input_path)
        segment = audio[start_ms:end_ms]
        segment.export(output_path, format="wav")
        return output_path