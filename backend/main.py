from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
import subprocess
import platform
import os
import re
import json
from pydantic import BaseModel
from typing import List, Optional
import tkinter as tk
from tkinter import filedialog
from ad_fetcher import get_computers

SETTINGS_FILE = "settings.json"


# Модели Pydantic для валидации данных настроек
class Preset(BaseModel):
    name: str
    ip: str

class ReservedComputer(BaseModel):
    name: str
    target: str

class Settings(BaseModel):
    cmrcviewer_path: str
    presets: List[Preset]
    dataSource: str
    csvPath: Optional[str] = ""
    psScriptPath: Optional[str] = ""
    reservedComputers: List[ReservedComputer]
    showReservedComputersBlock: bool
    theme: str


# Функция для загрузки настроек из файла
def load_settings() -> dict:
    default_settings = {
        "cmrcviewer_path": r"SCCM_Remote_Control/CmRcViewer.exe",
        "presets": [
            {"name": "Отделение 0114", "ip": "10.114.2."},
            {"name": "Отделение 0214", "ip": "10.114.9."}
        ],
        "dataSource": "csv",
        "csvPath": "data/ad_pc.csv",
        "psScriptPath": "",
        "reservedComputers": [],
        "showReservedComputersBlock": True,
        "theme": "system"
    }
    if not os.path.exists(SETTINGS_FILE):
        return default_settings
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            if os.path.getsize(SETTINGS_FILE) > 0:
                # Загружаем текущие настройки
                current_settings = json.load(f)
                # Объединяем с дефолтными, чтобы добавить новые поля, если их нет
                # Это предотвратит ошибки, если settings.json был создан до добавления новых полей
                return {**default_settings, **current_settings}
            return default_settings
    except (json.JSONDecodeError, IOError):
        return default_settings

# Функция для сохранения настроек в файл
def save_settings(settings: dict):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=4)

# Функция для проверки корректности IP-адреса
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
def is_valid_hostname(name: str) -> bool:
    return bool(re.match(r'^[A-Za-z0-9._-]{1,63}$', name))


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загружаем настройки при старте приложения
settings = load_settings()

@app.get("/browse-file")
def browse_for_file(file_type: str = Query("all", description="Тип файла: 'exe', 'csv', 'ps1' или 'all'")):
    """
    Открывает на сервере системное диалоговое окно для выбора файла.
    Возвращает путь к выбранному файлу.
    """
    if platform.system() != "Windows":
        raise HTTPException(status_code=501, detail="Функция выбора файла доступна только на Windows-сервере.")

    root = tk.Tk()
    root.withdraw()
    root.wm_attributes("-topmost", 1)  # Показать диалоговое окно поверх всех окон

    file_types_map = {
        "exe": [("Исполняемые файлы", "*.exe"), ("Все файлы", "*.*")],
        "csv": [("CSV файлы", "*.csv"), ("Все файлы", "*.*")],
        "ps1": [("PowerShell скрипты", "*.ps1"), ("Все файлы", "*.*")],
        "all": [("Все файлы", "*.*")],
    }
    
    file_path = filedialog.askopenfilename(
        title="Выберите файл",
        filetypes=file_types_map.get(file_type, file_types_map["all"])
    )
    
    root.destroy()

    if file_path:
        return {"path": file_path}
    else:
        return {"path": ""}

@app.get("/settings", response_model=Settings)
def get_settings():
    """Возвращает текущие настройки клиенту."""
    return settings

@app.post("/settings")
def update_settings(new_settings: Settings):
    global settings
    settings_dict = new_settings.model_dump(by_alias=True) if hasattr(new_settings, 'model_dump') else new_settings.dict(by_alias=True)
    settings = settings_dict
    save_settings(settings)
    return {"status": "ok", "message": "Настройки успешно сохранены."}

@app.get("/computers")
def list_computers():
    """
    Возвращает список компьютеров в зависимости от источника данных,
    указанного в настройках.
    """
    data_source = settings.get("dataSource")
    
    if data_source == "csv":
        csv_path = settings.get("csvPath")
        if not csv_path:
            # Если путь к CSV не указан, возвращаем пустой список
            return []
        return get_computers(csv_path)
    
    elif data_source == "ps":
        # Здесь в будущем будет логика для вызова PowerShell скрипта
        print("Источник данных 'PowerShell' еще не реализован.")
        return []
        
    # Возвращаем пустой список, если источник данных не выбран или не поддерживается
    return []

@app.get("/launch")
def launch_cmrc(ip: str = Query(..., description="IP-адрес или имя хоста для подключения")):
    if not (is_valid_ip(ip) or is_valid_hostname(ip)):
        raise HTTPException(status_code=400, detail="Некорректный IP-адрес или имя хоста")

    if platform.system() != "Windows":
        raise HTTPException(status_code=500, detail="CmRcViewer доступен только на Windows")

    cmrcviewer_path = settings.get("cmrcviewer_path")
    if not os.path.isfile(cmrcviewer_path):
        raise HTTPException(status_code=500, detail=f"CmRcViewer.exe не найден по пути: {cmrcviewer_path}. Проверьте путь в параметрах.")

    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    startupinfo.wShowWindow = 3

    try:
        cmd = f'"{cmrcviewer_path}" {ip} "/timeout:0"'
        subprocess.Popen(cmd, startupinfo=startupinfo, shell=False)
        return {"status": "ok", "message": f"Подключение к {ip} инициировано."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка запуска: {str(e)}")


@app.get("/open-folder")
def open_remote_folder(target: str = Query(..., description="IP-адрес или имя хоста для открытия папки")):
    if not (is_valid_ip(target) or is_valid_hostname(target)):
        raise HTTPException(status_code=400, detail="Некорректный IP-адрес или имя хоста")

    if platform.system() != "Windows":
        raise HTTPException(status_code=500, detail="Открытие папки доступно только на Windows")

    try:
        # Формируем путь к сетевой папке
        folder_path = f"\\\\{target}\\c$"
        os.startfile(folder_path)
        return {"status": "ok", "message": f"Попытка открыть папку: {folder_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при открытии папки: {str(e)}")

@app.get("/ping")
def start_ping(target: str = Query(..., description="IP-адрес или имя хоста для пинга")):
    if not (is_valid_ip(target) or is_valid_hostname(target)):
        raise HTTPException(status_code=400, detail="Некорректный IP-адрес или имя хоста")

    if platform.system() != "Windows":
        raise HTTPException(status_code=500, detail="Пинг доступен только на Windows")

    try:
        # Запускаем команду ping в новом окне командной строки
        # start cmd /k "ping -a {target} -t"
        # /k - оставляет окно открытым после выполнения команды
        subprocess.Popen(['cmd.exe', '/k', 'ping', '-a', target, '-t'], creationflags=subprocess.CREATE_NEW_CONSOLE)
        return {"status": "ok", "message": f"Пинг {target} запущен."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка запуска пинга: {str(e)}")
