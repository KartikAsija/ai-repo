import sys
import os
import time
import webbrowser
import threading
from pathlib import Path

# Ensure root directory is in sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

def open_browser():
    time.sleep(1.2)
    print("\n[Browser] Opening http://localhost:8001 in your default browser...")
    try:
        webbrowser.open("http://localhost:8001")
    except Exception as e:
        print(f"[Browser] Could not auto-open browser: {e}")

def main():
    print("=" * 65)
    print("  Starting Your AI Career Navigator (Linked Full-Stack)")
    print("=" * 65)
    print("  • Frontend + Backend linked together on: http://localhost:8001")
    print("  • Interactive API Documentation:         http://localhost:8001/docs")
    print("  • Press Ctrl+C in this terminal to stop.")
    print("=" * 65 + "\n")

    # Start browser opener in background thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Launch Uvicorn server directly
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8001, reload=True)

if __name__ == "__main__":
    main()

