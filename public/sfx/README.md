# Cinematic Audio Effects

This directory contains micro-audio files for the cinematic effects system.

## Required Audio Files

Please add the following audio files (1-2 seconds, mono, 50-120KB each):

- `bat-whoosh.mp3` - For The Dark Knight effect
- `dream-hum.mp3` - For Inception effect  
- `space-ping.mp3` - For Interstellar effect
- `forest-ambience.mp3` - For Avatar effect
- `drip.mp3` - For Parasite effect
- `sand-whisper.mp3` - For Dune effect

## Audio Requirements

- Duration: 1-2 seconds maximum
- Format: MP3 or WAV
- Channels: Mono preferred for smaller file size
- File size: 50-120KB each
- Volume: Should be normalized for consistent playback at 0.2 volume

## Usage

These files are loaded lazily when effects are first triggered and cached for performance. Audio playback is optional and controlled by user settings.