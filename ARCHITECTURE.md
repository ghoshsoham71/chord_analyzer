# Architecture Documentation

## System Overview

The Spotify Chord Analyzer is a FastAPI-based application that uses CrewAI to orchestrate multiple AI agents for analyzing songs and generating chord sheets.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client                                  │
│                     (HTTP Requests)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Application                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Routes                               │ │
│  │  - POST /api/v1/analyze                                    │ │
│  │  - GET  /api/v1/download/{task_id}                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CrewAI Orchestration                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Agent 1: Metadata Specialist                              │  │
│  │ - Fetch song info from Spotify                           │  │
│  │ - Tools: SpotifyInfoTool                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Agent 2: Lyrics Researcher                                │  │
│  │ - Fetch lyrics from Genius                               │  │
│  │ - Tools: LyricsFetchTool                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Agent 3: Audio Analyst (Multimodal)                       │  │
│  │ - Analyze audio for chords using LLM                     │  │
│  │ - Tools: AudioChordAnalysisTool                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Agent 4: Chord Mapper                                     │  │
│  │ - Map chords to lyrics positions                         │  │
│  │ - Tools: LyricsChordMapperTool, ChordTransposeTool       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Agent 5: Quality Controller                               │  │
│  │ - Review and validate output                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐    ┌──────────────┐
│   Spotify    │   │    Genius    │    │   LiteLLM    │
│     API      │   │     API      │    │   (OpenAI/   │
│              │   │              │    │   Gemini/    │
│              │   │              │    │   Claude)    │
└──────────────┘   └──────────────┘    └──────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  PDF Generator   │
                   │  (ReportLab)     │
                   └──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  Downloadable    │
                   │  Chord Sheet     │
                   └──────────────────┘
```

## Component Breakdown

### 1. FastAPI Layer
**Location:** `app/main.py`, `app/api/routes.py`

**Responsibilities:**
- HTTP request handling
- Request validation using Pydantic
- Response formatting
- File serving (PDF downloads)
- CORS configuration

**Key Endpoints:**
- `POST /api/v1/analyze` - Main analysis endpoint
- `GET /api/v1/download/{task_id}` - PDF download
- `GET /health` - Health check

### 2. Pydantic Schemas
**Location:** `app/schemas/models.py`

**Models:**
- `AnalyzeRequest` - Input validation
- `AnalyzeResponse` - Output formatting
- `SongInfo` - Song metadata
- `ChordSheet` - Complete chord sheet structure
- `ChordLine` - Individual line with chords

### 3. Service Layer
**Location:** `app/services/`

#### SpotifyService (`spotify.py`)
- Authenticates with Spotify API
- Extracts track metadata
- Downloads preview audio (30 seconds)
- Parses audio features

#### GeniusService (`genius.py`)
- Searches for song lyrics
- Cleans and formats lyrics
- Preserves section headers

#### PDFGenerator (`pdf_generator.py`)
- Creates professional chord sheets
- Handles chord positioning
- Applies transposition
- Uses ReportLab for PDF generation

### 4. CrewAI Layer
**Location:** `app/crew/`

#### Agents (`agents.py`)
Five specialized agents:

1. **Metadata Specialist**
   - Fetches Spotify track info
   - Extracts key, tempo, time signature

2. **Lyrics Researcher**
   - Searches Genius for lyrics
   - Cleans and formats text

3. **Audio Analyst** (Multimodal)
   - Analyzes audio using LLM
   - Extracts chord progressions
   - Identifies song structure

4. **Chord Mapper**
   - Maps chords to lyrics
   - Positions chords accurately
   - Handles transposition

5. **Quality Controller**
   - Reviews final output
   - Validates accuracy

#### Tasks (`tasks.py`)
Defines workflows for each agent:
- `fetch_metadata_task`
- `fetch_lyrics_task`
- `analyze_audio_task`
- `map_chords_to_lyrics_task`
- `quality_review_task`

#### Tools (`tools.py`)
Custom CrewAI tools:
- `SpotifyInfoTool` - Spotify integration
- `LyricsFetchTool` - Genius integration
- `AudioChordAnalysisTool` - Multimodal LLM analysis
- `ChordTransposeTool` - Transpose chords
- `LyricsChordMapperTool` - Map chords to lyrics

### 5. Utilities
**Location:** `app/utils/`

#### AudioUtils (`audio_utils.py`)
- Audio format conversion
- Base64 encoding for LLM
- Duration extraction
- Segment extraction

## Data Flow

### Request Flow
```
1. Client sends POST /analyze with Spotify URL
2. FastAPI validates request (Pydantic)
3. SpotifyService fetches track metadata
4. SpotifyService downloads 30s audio preview
5. CrewAI kicks off first crew:
   a. Metadata Agent confirms track info
   b. Lyrics Agent fetches lyrics from Genius
   c. Audio Analyst analyzes audio for chords (multimodal LLM)
6. CrewAI kicks off second crew:
   a. Chord Mapper maps chords to lyrics positions
   b. Quality Controller validates output
7. PDFGenerator creates chord sheet PDF
8. Response returned with PDF download URL
9. Client downloads PDF via GET /download/{task_id}
```

### Multimodal Audio Analysis

The key innovation is using multimodal LLMs to analyze actual audio:

```python
# Audio is encoded to base64
audio_base64 = encode_audio_to_base64(audio_path)

# Sent to LLM with audio input capability
response = litellm.completion(
    model="gpt-4o-audio-preview",
    messages=[{
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
    }]
)
```

This allows the LLM to:
- Listen to actual audio
- Identify exact chords played
- Determine key and tempo
- Map chord changes to timing

## LiteLLM Integration

**Purpose:** Avoid vendor lock-in

**Benefits:**
- Single API for multiple providers
- Easy provider switching
- Unified error handling
- Cost optimization

**Supported Models:**
```python
# OpenAI
model = "gpt-4o-audio-preview"

# Google Gemini
model = "gemini-2.0-flash-exp"

# Anthropic
model = "claude-3-5-sonnet-20241022"
```

Configuration via environment variables only.

## Error Handling

### Levels:
1. **Validation Errors** - Pydantic catches invalid input
2. **Service Errors** - API failures, missing data
3. **Agent Errors** - LLM failures, tool errors
4. **System Errors** - File I/O, network issues

### Strategy:
- Raise HTTPException with appropriate status codes
- Include detailed error messages
- Log errors for debugging
- Clean up temporary files in finally blocks

## Security Considerations

1. **API Keys** - Stored in environment variables
2. **CORS** - Configured for production domains
3. **File Cleanup** - Temporary files deleted after use
4. **Input Validation** - Pydantic schemas validate all input
5. **Rate Limiting** - Should be added for production

## Scalability

### Current Limitations:
- Synchronous processing
- In-memory task storage
- No caching

### Improvements for Scale:
1. **Add Celery** for background processing
2. **Add Redis** for caching and task queue
3. **Add Database** for persistent storage
4. **Load Balancing** for multiple workers
5. **CDN** for PDF delivery

## Performance Metrics

### Typical Request:
- Spotify API: ~200ms
- Genius API: ~500ms
- Audio download: ~1-2s
- Audio analysis (LLM): ~10-30s
- Chord mapping (LLM): ~5-10s
- PDF generation: ~500ms

**Total: ~20-45 seconds per song**

### Optimization Opportunities:
- Parallel API calls
- Cached results
- Faster models for text tasks
- Audio chunking for long songs

## Testing Strategy

1. **Unit Tests** - Test individual components
2. **Integration Tests** - Test service interactions
3. **End-to-End Tests** - Full workflow tests
4. **Load Tests** - Performance under load

Example test script provided: `test_api.py`

## Deployment Considerations

### Development:
```bash
python -m app.main
```

### Production:
```bash
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

### Docker:
```bash
docker build -t spotify-chord-analyzer .
docker run -p 8000:8000 --env-file .env spotify-chord-analyzer
```

### Environment Variables:
See `.env.example` for all required variables.

## Future Enhancements

1. **Frontend** - Web UI for easier use
2. **Batch Processing** - Analyze multiple songs
3. **User Accounts** - Save analysis history
4. **More Sources** - YouTube, SoundCloud
5. **Advanced Features**:
   - Guitar tabs generation
   - MIDI export
   - Practice mode with tempo adjustment
   - Chord diagram generation