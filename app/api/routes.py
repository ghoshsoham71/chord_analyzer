import os
import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from crewai import Crew, Process
from app.schemas import AnalyzeRequest, AnalyzeResponse, SongInfo, ChordSheet, ChordLine, ErrorResponse
from app.services import SpotifyService, PDFGenerator
from app.crew import MusicAgents, MusicTasks

router = APIRouter()

# Storage for generated PDFs
TEMP_DIR = Path(os.getenv("TEMP_DIR", "./temp"))
TEMP_DIR.mkdir(exist_ok=True)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_song(request: AnalyzeRequest):
    """
    Analyze a Spotify song and generate chord sheet PDF
    
    This endpoint orchestrates multiple AI agents using CrewAI to:
    1. Fetch song metadata from Spotify
    2. Download audio preview
    3. Fetch lyrics from Genius
    4. Analyze audio for chord progressions using multimodal LLM
    5. Map chords to lyrics
    6. Generate downloadable PDF chord sheet
    """
    
    task_id = str(uuid.uuid4())
    audio_path = TEMP_DIR / f"{task_id}.mp3"
    
    try:
        # Initialize services
        spotify_service = SpotifyService()
        pdf_generator = PDFGenerator()
        
        # Step 1: Get song info
        song_info = spotify_service.get_track_info(request.spotify_url)
        
        # Step 2: Download audio preview
        if song_info.preview_url:
            success = await spotify_service.download_preview(
                song_info.preview_url, 
                str(audio_path)
            )
            if not success:
                raise HTTPException(
                    status_code=404, 
                    detail="Audio preview not available for this track"
                )
        else:
            raise HTTPException(
                status_code=404, 
                detail="No preview URL available for this track"
            )
        
        # Step 3: Create CrewAI agents
        metadata_agent = MusicAgents.metadata_agent()
        lyrics_agent = MusicAgents.lyrics_agent()
        audio_analyst = MusicAgents.audio_analyst_agent()
        chord_mapper = MusicAgents.chord_mapper_agent()
        quality_controller = MusicAgents.quality_control_agent()
        
        # Step 4: Create tasks
        fetch_metadata = MusicTasks.fetch_metadata_task(
            request.spotify_url, 
            metadata_agent
        )
        
        fetch_lyrics = MusicTasks.fetch_lyrics_task(
            song_info.title, 
            song_info.artist, 
            lyrics_agent
        )
        
        analyze_audio = MusicTasks.analyze_audio_task(
            str(audio_path),
            song_info.title,
            song_info.artist,
            audio_analyst
        )
        
        # Step 5: Execute crew for initial analysis
        analysis_crew = Crew(
            agents=[metadata_agent, lyrics_agent, audio_analyst],
            tasks=[fetch_metadata, fetch_lyrics, analyze_audio],
            process=Process.sequential,
            verbose=True
        )
        
        analysis_result = analysis_crew.kickoff()
        
        # Parse results
        try:
            # Get the last task output which should be the audio analysis
            audio_analysis = json.loads(str(analyze_audio.output))
            lyrics_result = json.loads(str(fetch_lyrics.output))
            lyrics_text = lyrics_result.get('lyrics', '')
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse analysis results: {str(e)}"
            )
        
        # Step 6: Map chords to lyrics
        map_chords = MusicTasks.map_chords_to_lyrics_task(
            lyrics_text,
            json.dumps(audio_analysis),
            request.transpose,
            chord_mapper
        )
        
        review_task = MusicTasks.quality_review_task(
            "",  # Will be filled after chord mapping
            quality_controller
        )
        
        mapping_crew = Crew(
            agents=[chord_mapper, quality_controller],
            tasks=[map_chords, review_task],
            process=Process.sequential,
            verbose=True
        )
        
        mapping_result = mapping_crew.kickoff()
        
        # Parse chord mapping
        try:
            chord_mapping = json.loads(str(map_chords.output))
            lines_data = chord_mapping.get('lines', [])
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse chord mapping"
            )
        
        # Step 7: Create chord sheet structure
        chord_lines = []
        for line_obj in lines_data:
            chord_lines.append(
                ChordLine(
                    lyrics_line=line_obj.get('lyrics_line', ''),
                    chords=line_obj.get('chords', [])
                )
            )
        
        chord_sheet = ChordSheet(
            song_info=song_info,
            key=audio_analysis.get('key', 'Unknown'),
            tempo=audio_analysis.get('tempo', 0),
            capo=None,  # Could be calculated based on transposition
            lines=chord_lines
        )
        
        # Step 8: Generate PDF
        pdf_path = TEMP_DIR / f"{task_id}.pdf"
        pdf_generator.generate_chord_sheet(
            chord_sheet,
            str(pdf_path),
            transpose=request.transpose
        )
        
        # Step 9: Return response
        from app.schemas import AudioAnalysis
        
        return AnalyzeResponse(
            status="success",
            task_id=task_id,
            pdf_url=f"/download/{task_id}",
            song_info=song_info,
            analysis=AudioAnalysis(
                key=audio_analysis.get('key'),
                tempo=audio_analysis.get('tempo'),
                time_signature=audio_analysis.get('time_signature'),
                chord_progressions=audio_analysis.get('chord_progressions', []),
                structure=audio_analysis.get('structure')
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
    finally:
        # Cleanup audio file
        if audio_path.exists():
            audio_path.unlink()


@router.get("/download/{task_id}")
async def download_chord_sheet(task_id: str):
    """Download the generated chord sheet PDF"""
    
    pdf_path = TEMP_DIR / f"{task_id}.pdf"
    
    if not pdf_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Chord sheet not found. It may have been deleted or never existed."
        )
    
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"chord_sheet_{task_id}.pdf"
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "spotify-chord-analyzer"}