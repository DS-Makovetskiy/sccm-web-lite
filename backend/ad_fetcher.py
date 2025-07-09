import csv
from pathlib import Path

def get_computers(file_path_str: str):
    """
    Читает данные о компьютерах из указанного CSV-файла.
    Принимает путь к файлу в виде строки.
    """
    # Преобразуем строку пути в объект Path для надежной работы
    file_path = Path(file_path_str)
    
    # Проверяем, существует ли файл, перед попыткой чтения
    if not file_path.is_file():
        # Если файл не найден, возвращаем пустой список.
        # Ошибку можно будет обработать на стороне main.py
        print(f"Ошибка: Файл не найден по пути {file_path_str}")
        return []

    computers = []
    try:
        # Используем кодировку utf-16, как было в вашем оригинальном файле
        with file_path.open(mode='r', encoding="utf-16") as f:
            # Пропускаем первую строку (заголовок), если он есть
            next(f, None) 
            reader = csv.reader(f, delimiter=',')
            for row in reader:
                # Проверяем, что в строке есть хотя бы 2 элемента
                if len(row) >= 2:
                    computers.append({
                        "name": row[0].strip(),     # имя ПК (первая колонка)
                        "type": row[1].strip(),     # тип
                        "fio":  row[2].strip()      # ФИО + отдел (вторая колонка)
                    })
    except Exception as e:
        print(f"Ошибка при чтении или обработке файла {file_path_str}: {e}")
        # В случае ошибки возвращаем пустой список, чтобы приложение не падало
        return []
            
    return computers