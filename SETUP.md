# Setup and Deployment Guide

## Quick Start

### 1. Prerequisites
- Python 3.9+
- ffmpeg (for audio processing)

```bash
# Install ffmpeg
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg
```

### 2. Clone and Setup

```bash
# Navigate to project directory
cd spotify-chord-analyzer

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API credentials:

#### Required: Spotify API
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Copy Client ID and Client Secret to `.env`

#### Required: Genius API
1. Go to https://genius.com/api-clients
2. Create a new API client
3. Generate an access token
4. Copy token to `.env`

#### Required: LLM Provider (choose one)

**Option A: OpenAI (Recommended)**
- Best for audio analysis
- Get API key from https://platform.openai.com/api-keys
- Set `OPENAI_API_KEY` in `.env`
- Use `AUDIO_ANALYSIS_MODEL=gpt-4o-audio-preview`

**Option B: Google Gemini (Free tier available)**
- Has generous free tier
- Get API key from https://aistudio.google.com/app/apikey
- Set `GEMINI_API_KEY` in `.env`
- Use `AUDIO_ANALYSIS_MODEL=gemini-2.0-flash-exp`

**Option C: Anthropic Claude**
- Get API key from https://console.anthropic.com/
- Set `ANTHROPIC_API_KEY` in `.env`
- Use `AUDIO_ANALYSIS_MODEL=claude-3-5-sonnet-20241022`

### 4. Run the Application

```bash
# Development mode with auto-reload
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Usage

### Analyze a Song

**Endpoint:** `POST /api/v1/analyze`

**Request:**
```json
{
  "spotify_url": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
  "transpose": 0
}
```

**Response:**
```json
{
  "status": "success",
  "task_id": "abc-123-def",
  "pdf_url": "/api/v1/download/abc-123-def",
  "song_info": {
    "title": "Wonderwall",
    "artist": "Oasis",
    "key": "F# Minor",
    "tempo": 87.5
  }
}
```

### Download Chord Sheet

**Endpoint:** `GET /api/v1/download/{task_id}`

Returns PDF file.

### Test the API

```bash
# Make test script executable
chmod +x test_api.py

# Run tests
python test_api.py
```

## Production Deployment

### Using Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t spotify-chord-analyzer .
docker run -p 8000:8000 --env-file .env spotify-chord-analyzer
```

### Using Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./temp:/app/temp
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

### Environment Variables for Production

```env
# Production settings
APP_HOST=0.0.0.0
APP_PORT=8000

# Use production-grade models
AUDIO_ANALYSIS_MODEL=gpt-4o-audio-preview
TEXT_ANALYSIS_MODEL=gpt-4o-mini

# Configure CORS properly
# In app/main.py, update allow_origins to your domain
```

## Troubleshooting

### Common Issues

**1. Audio download fails**
- Ensure ffmpeg is installed
- Check if Spotify preview URL is available (not all tracks have previews)

**2. LLM calls fail**
- Verify API keys are correct
- Check API quota/billing
- Ensure model names are correct

**3. CrewAI tasks timeout**
- Increase timeout in routes.py
- Use faster models for development
- Check network connectivity

**4. PDF generation fails**
- Ensure temp directory exists and is writable
- Check reportlab installation

### Logs

Enable verbose logging:
```python
# In app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Cost Optimization

### Free Tier Options

1. **Spotify API**: Free
2. **Genius API**: Free
3. **Google Gemini**: 1500 requests/day free
4. **Audio Analysis**: ~$0.02-0.10 per song (OpenAI)

### Reduce Costs

- Use `gpt-4o-mini` for text tasks
- Use Gemini for audio if available
- Cache results
- Implement rate limiting

## Performance Tips

1. **Parallel Processing**: Use async for I/O operations
2. **Caching**: Cache Spotify/Genius results
3. **Queue System**: Add Celery for background processing
4. **Database**: Store results in PostgreSQL/MongoDB

## Next Steps

- Add user authentication
- Implement result caching
- Add batch processing
- Create web frontend
- Add more music sources beyond Spotify