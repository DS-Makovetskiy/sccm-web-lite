import subprocess

def run_cmrcviewer(ip: str):    
    path = r"C:\\Windows\\System32\\cmd.exe"
    # path = r"C:\Program Files (x86)\Configuration Manager Remote Control\CmRcViewer.exe"
    try:
        subprocess.Popen([path, "/k", "notepad"])
        # subprocess.Popen([path, ip, "/timeout:0,3"])
        return {"status": "success", "ip": ip}
    except Exception as e:
        return {"status": "error", "message": str(e)}
