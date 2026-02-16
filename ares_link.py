import sys
import subprocess
import os
import urllib.parse

def handle_request(url):
    # Remove the 'avcks://' prefix
    encoded_command = url.replace('avcks://', '', 1)
    # Decode URL-encoded characters (like spaces)
    command = urllib.parse.unquote(encoded_command)
    
    print(f"[ARES-LINK] Command Received: {command}")
    
    try:
        # Check if it's a known protocol/web link or a local path
        if ':' in command and not command.startswith('C:'):
            # Launch via system shell (handles protocols like spotify:, ms-settings:, etc.)
            subprocess.Popen(f"start {command}", shell=True)
        else:
            # Launch local file/path directly
            os.startfile(command)
    except Exception as e:
        with open("ares_error.log", "a") as f:
            f.write(f"Error launching '{command}': {str(e)}\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        handle_request(sys.argv[1])
