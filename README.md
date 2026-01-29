# Spotify Chord Analyzer

FastAPI + CrewAI application for extracting lyrics and chord progressions from Spotify songs.

## Features
- Extract lyrics using Genius API
- Analyze audio and extract chords using multimodal LLM
- Generate downloadable PDF chord sheets with transposition support
- CrewAI orchestration with specialized agents

## Environment Variables

Create a `.env` file with the following:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Genius API (Free Tier)
GENIUS_ACCESS_TOKEN=your_genius_access_token

# LiteLLM Configuration (supports multiple providers)
# Option 1: OpenAI (for audio analysis - supports audio input)
OPENAI_API_KEY=your_openai_api_key

# Option 2: Anthropic Claude (for audio analysis - supports audio input)
# ANTHROPIC_API_KEY=your_anthropic_api_key

# Option 3: Google Gemini (free tier available, supports audio)
# GEMINI_API_KEY=your_gemini_api_key

# Model Configuration
AUDIO_ANALYSIS_MODEL=gpt-4o-audio-preview  # or claude-3-5-sonnet-20241022 or gemini-2.0-flash-exp
TEXT_ANALYSIS_MODEL=gpt-4o-mini  # Cheaper model for text tasks

# Application
APP_HOST=0.0.0.0
APP_PORT=8000
TEMP_DIR=./temp
```

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python -m app.main
```

## API Endpoints

### POST /analyze
Analyze a Spotify song and generate chord sheet

**Request Body:**
```json
{
  "spotify_url": "https://open.spotify.com/track/...",
  "transpose": 0
}
```

**Response:**
```json
{
  "status": "success",
  "pdf_url": "/download/{task_id}",
  "song_info": {
    "title": "Song Title",
    "artist": "Artist Name",
    "key": "C Major",
    "tempo": "120 BPM"
  }
}
```

### GET /download/{task_id}
Download the generated PDF chord sheet

## Project Structure

```
spotify-chord-analyzer/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # API endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── models.py           # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── spotify.py          # Spotify integration
│   │   ├── genius.py           # Genius API integration
│   │   └── pdf_generator.py   # PDF creation
│   ├── crew/
│   │   ├── __init__.py
│   │   ├── agents.py           # CrewAI agents
│   │   ├── tasks.py            # CrewAI tasks
│   │   └── tools.py            # Custom tools
│   └── utils/
│       ├── __init__.py
│       └── audio_utils.py      # Audio processing utilities
├── temp/                        # Temporary files
├── requirements.txt
├── .env
└── README.md
```