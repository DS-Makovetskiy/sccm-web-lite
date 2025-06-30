import csv
from pathlib import Path

def get_computers():
    file_path = Path(__file__).parent / "data" / "ad_pc.csv"
    computers = []

    with file_path.open(encoding="utf-16") as f:
        reader = csv.DictReader(f, delimiter=',')
        for row in reader:
            computers.append({
                "name": row.get("Имя", ""),        # имя ПК
                "fio": row.get("Описание", "")     # ФИО + отдел
            })

    return computers