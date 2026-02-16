import os
import sys
import winreg

def setup_protocol():
    protocol_name = "avcks"
    # Get the absolute path to the handler script and python executable
    script_path = os.path.abspath("ares_link.py")
    python_path = sys.executable
    
    # The command that Windows will run
    # Format: python.exe "path/to/ares_link.py" "%1"
    command = f'"{python_path}" "{script_path}" "%1"'

    try:
        # Create the Registry Key
        key_path = rf"Software\Classes\{protocol_name}"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path) as key:
            winreg.SetValue(key, "", winreg.REG_SZ, f"URL:{protocol_name} Protocol")
            winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")
            
            with winreg.CreateKey(key, r"shell\open\command") as cmd_key:
                winreg.SetValue(cmd_key, "", winreg.REG_SZ, command)
        
        print("\n========================================")
        print("🚀 ARES DEEP LINK SETUP SUCCESSFUL")
        print("========================================")
        print(f"\nProtocol '{protocol_name}://' is now registered.")
        print(f"Handler: {script_path}")
        print("\nYou can now launch apps from AVCKS without any background server!")
        print("========================================\n")
        
    except Exception as e:
        print(f"\n❌ SETUP FAILED: {str(e)}")
        print("Please try running this terminal as Administrator.")

if __name__ == "__main__":
    setup_protocol()
    input("Press Enter to finish...")
