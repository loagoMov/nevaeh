import os
import argparse
import ssl
from pytubefix import YouTube

# Bypass macOS SSL certificate verification issue
ssl._create_default_https_context = ssl._create_unverified_context

def download_audio(url, output_path="."):
    try:
        print(f"Fetching video information for: {url}")
        
        # Use client='ANDROID' or 'IOS' which often bypasses PoToken restrictions
        yt = YouTube(url, client='ANDROID')
        
        # Get the audio-only stream
        audio_stream = yt.streams.get_audio_only()
        
        if not audio_stream:
            print("Could not find an audio stream for this video.")
            return

        print(f"Downloading: {yt.title}...")
        
        # Download the file
        downloaded_file = audio_stream.download(output_path=output_path)
        
        # YouTube audio streams are typically mp4 (m4a) or webm. 
        # We rename the extension to .m4a so audio players recognize it easily.
        base, ext = os.path.splitext(downloaded_file)
        new_file = base + '.m4a'
        
        # If a file with the same name already exists, remove it
        if os.path.exists(new_file):
            os.remove(new_file)
            
        os.rename(downloaded_file, new_file)
        
        print(f"Successfully downloaded to: {new_file}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        print("\nTroubleshooting tips:")
        print("1. YouTube frequently updates their systems, which can block downloads.")
        print("2. Ensure you have the absolute latest version: pip install -U pytubefix")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download audio from a YouTube video.")
    parser.add_argument("url", nargs="?", default="https://youtu.be/mIMszyXWuhA?si=4D40qHQAOC_B1iGt", help="The YouTube video URL")
    parser.add_argument("-o", "--output", default=".", help="Output directory (default: current directory)")
    
    args = parser.parse_args()
    print(f"Using URL: {args.url}")
    download_audio(args.url, args.output)
