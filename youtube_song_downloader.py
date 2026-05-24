"""
YouTube Song Downloader
-----------------------
Downloads songs from YouTube as MP3 files using yt-dlp.

Usage:
    python youtube_song_downloader.py

Requirements:
    pip install yt-dlp certifi

Optional (for best audio quality MP3 conversion):
    brew install ffmpeg   (macOS)
"""

import subprocess
import sys
import os
import ssl
import certifi


def fix_ssl_certificates():
    """
    Fix SSL certificate issues on macOS.
    macOS Python often lacks the system root certificates.
    This installs them from the certifi package.
    """
    # Point the default SSL context to certifi's certificate bundle
    os.environ["SSL_CERT_FILE"] = certifi.where()
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

    # Also patch the default SSL context globally
    try:
        default_context = ssl.create_default_context(cafile=certifi.where())
        ssl._create_default_https_context = lambda: default_context
    except Exception:
        pass  # Non-critical, the env vars should be enough


def ensure_dependencies_installed():
    """Install yt-dlp and certifi if not already available."""
    for package, import_name in [("certifi", "certifi"), ("yt-dlp", "yt_dlp")]:
        try:
            __import__(import_name)
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", package],
                stdout=subprocess.DEVNULL,
            )
            print(f"✅ {package} installed successfully!")


def check_ffmpeg():
    """Check if ffmpeg is available for MP3 conversion."""
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except FileNotFoundError:
        return False


def download_song(query: str, output_dir: str = "downloads"):
    """
    Download a song from YouTube.

    Args:
        query: A YouTube URL or a search term (e.g. "Adele Hello")
        output_dir: Directory to save the downloaded file
    """
    import yt_dlp

    os.makedirs(output_dir, exist_ok=True)

    has_ffmpeg = check_ffmpeg()

    if not has_ffmpeg:
        print("⚠️  ffmpeg not found. Downloading best audio (may not be MP3).")
        print("   Install ffmpeg for automatic MP3 conversion: brew install ffmpeg\n")

    # Build yt-dlp options
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(output_dir, "%(title)s.%(ext)s"),
        "noplaylist": True,
        "quiet": False,
        "no_warnings": False,
        # Use certifi's CA bundle to fix SSL on macOS
        "nocheckcertificate": False,
    }

    # Try to set the CA bundle path for yt-dlp's requests
    ca_bundle = certifi.where()
    if os.path.exists(ca_bundle):
        ydl_opts["client_certificate"] = None  # Not needed, but keeps options clean
        # yt-dlp uses the SSL_CERT_FILE env var we set in fix_ssl_certificates()

    # If ffmpeg is available, convert to MP3
    if has_ffmpeg:
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ]

    # If the query is not a URL, treat it as a search term
    if not query.startswith(("http://", "https://", "www.")):
        query = f"ytsearch1:{query}"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"🔍 Searching & downloading: {query}\n")
            info = ydl.extract_info(query, download=True)

            # Handle search results
            if "entries" in info:
                info = info["entries"][0]

            title = info.get("title", "Unknown")
            ext = "mp3" if has_ffmpeg else info.get("ext", "webm")
            filepath = os.path.join(output_dir, f"{title}.{ext}")

            print(f"\n{'='*50}")
            print(f"✅ Download complete!")
            print(f"🎵 Title:  {title}")
            print(f"📁 Saved:  {filepath}")
            print(f"{'='*50}")
            return filepath

    except Exception as e:
        error_msg = str(e)
        if "CERTIFICATE_VERIFY_FAILED" in error_msg:
            print("\n⚠️  SSL still failing — retrying with certificate check disabled...")
            ydl_opts["nocheckcertificate"] = True
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(query, download=True)
                    if "entries" in info:
                        info = info["entries"][0]
                    title = info.get("title", "Unknown")
                    ext = "mp3" if has_ffmpeg else info.get("ext", "webm")
                    filepath = os.path.join(output_dir, f"{title}.{ext}")
                    print(f"\n{'='*50}")
                    print(f"✅ Download complete!")
                    print(f"🎵 Title:  {title}")
                    print(f"📁 Saved:  {filepath}")
                    print(f"{'='*50}")
                    return filepath
            except Exception as e2:
                print(f"\n❌ Download failed: {e2}")
                return None
        else:
            print(f"\n❌ Download failed: {e}")
            return None


def main():
    print("=" * 50)
    print("  🎵  YouTube Song Downloader  🎵")
    print("=" * 50)
    print()
    print("Enter a YouTube URL or search for a song by name.")
    print("Type 'quit' to exit.\n")

    while True:
        query = input("🎶 Enter URL or song name: ").strip()

        if not query:
            print("Please enter a URL or song name.\n")
            continue

        if query.lower() in ("quit", "exit", "q"):
            print("\n👋 Goodbye!")
            break

        download_song(query)
        print()


if __name__ == "__main__":
    ensure_dependencies_installed()
    fix_ssl_certificates()
    main()
