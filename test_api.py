#!/usr/bin/env python3
"""
Example usage of the Spotify Chord Analyzer API
"""

import requests
import json
import time


BASE_URL = "http://localhost:8000/api/v1"


def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)


def analyze_song(spotify_url: str, transpose: int = 0):
    """
    Analyze a song and generate chord sheet
    
    Args:
        spotify_url: Spotify track URL
        transpose: Semitones to transpose (-11 to +11)
    """
    print(f"Analyzing song: {spotify_url}")
    print(f"Transpose: {transpose}")
    
    payload = {
        "spotify_url": spotify_url,
        "transpose": transpose
    }
    
    print("Sending request...")
    response = requests.post(
        f"{BASE_URL}/analyze",
        json=payload,
        timeout=300  # 5 minutes timeout for long analysis
    )
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Analysis successful!")
        print(f"Task ID: {result['task_id']}")
        print(f"Song: {result['song_info']['title']} by {result['song_info']['artist']}")
        print(f"Key: {result['song_info'].get('key', 'N/A')}")
        print(f"Tempo: {result['song_info'].get('tempo', 'N/A')} BPM")
        print(f"\nPDF Download URL: {BASE_URL}{result['pdf_url']}")
        
        if result.get('analysis'):
            print(f"\nAnalysis Details:")
            print(f"  Detected Key: {result['analysis'].get('key')}")
            print(f"  Detected Tempo: {result['analysis'].get('tempo')} BPM")
            print(f"  Time Signature: {result['analysis'].get('time_signature')}/4")
            print(f"  Structure: {result['analysis'].get('structure')}")
        
        # Download the PDF
        download_pdf(result['task_id'])
        
        return result
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.json())
        return None


def download_pdf(task_id: str):
    """Download the generated PDF"""
    print(f"\nDownloading PDF for task {task_id}...")
    
    response = requests.get(f"{BASE_URL}/download/{task_id}")
    
    if response.status_code == 200:
        filename = f"chord_sheet_{task_id}.pdf"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✅ PDF saved as: {filename}")
    else:
        print(f"❌ Failed to download PDF: {response.status_code}")


def main():
    """Run example tests"""
    print("=" * 50)
    print("Spotify Chord Analyzer - API Test")
    print("=" * 50)
    print()
    
    # Test health check
    test_health_check()
    
    # Example 1: Analyze a song without transposition
    print("\n" + "=" * 50)
    print("Example 1: Basic Analysis")
    print("=" * 50)
    analyze_song(
        spotify_url="https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",  # Wonderwall
        transpose=0
    )
    
    # Example 2: Analyze with transposition
    print("\n" + "=" * 50)
    print("Example 2: Analysis with Transposition")
    print("=" * 50)
    analyze_song(
        spotify_url="https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
        transpose=2  # Transpose up 2 semitones
    )


if __name__ == "__main__":
    main()