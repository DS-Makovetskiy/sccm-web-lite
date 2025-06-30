from process_launcher import run_cmrcviewer
from ad_fetcher import get_computers
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
import subprocess
import platform
import os
import re

# Функция для проверки корректности IP-адреса
# Проверяет, что IP состоит из 4 чисел от 0 до 255,
def is_valid_ip(ip: str) -> bool:
    parts = ip.strip().split(".")
    if len(parts) != 4:
        return False
    for part in parts:
        if not part.isdigit():
            return False
        number = int(part)
        if number < 0 or number > 255:
            return False
    return True

# Функция для проверки корректности имени хоста
# Проверяет, что имя состоит из букв, цифр, точек, дефисов
def is_valid_hostname(name: str) -> bool:
    return bool(re.match(r'^[A-Za-z0-9._-]{1,63}$', name))

app = FastAPI()

@app.get("/computers")
def list_computers():
    return get_computers()

@app.post("/connect/{ip}")
def connect_to_computer(ip: str):
    return run_cmrcviewer(ip)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Путь к CmRcViewer.exe — проверь и укажи корректный
CMRCVIEWER_PATH = r"C:\apps\SCCM Remote Control\CmRcViewer.exe"

@app.get("/launch")
def launch_cmrc(ip: str = Query(..., description="IP-адрес компьютера")):
    if not (is_valid_ip(ip) or is_valid_hostname(ip)):
        raise HTTPException(status_code=400, detail="Некорректный IP-адрес или имя хоста")
    # if not ip or len(ip.split(".")) != 4:
    #     raise HTTPException(status_code=400, detail="Некорректный IP-адрес")

    if platform.system() != "Windows":
        raise HTTPException(status_code=500, detail="CmRcViewer доступен только на Windows")

    if not os.path.isfile(CMRCVIEWER_PATH):
        raise HTTPException(status_code=500, detail="CmRcViewer.exe не найден. Проверь путь.")

    # Настройка запуска процесса в развернутом виде
    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    startupinfo.wShowWindow = 3  # 3 — SW_MAXIMIZE

    try:
        cmd = f'"{CMRCVIEWER_PATH}" {ip} "/timeout:0"'
        subprocess.Popen(cmd, startupinfo=startupinfo, shell=False)
        return {"status": "ok", "message": f"Подключение к {ip} инициировано."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка запуска: {str(e)}")
