# 📘 Git + GitHub: Полезные команды и сценарии

## 🆕 1. Создание нового проекта и публикация на GitHub

### 🔧 Локально:
```bash
git init                                # Инициализация Git в папке проекта
echo "node_modules/" >> .gitignore      # Создание .gitignore (пример)
git add .
git commit -m "Initial commit"
```

### ☁️ На GitHub:
1. Создай новый репозиторий **без README / .gitignore / LICENSE**.
2. Свяжи локальный проект с удалённым:
```bash
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

## 🧲 2. Клонирование репозитория на другом компьютере
```bash
git clone https://github.com/USERNAME/REPO.git
cd REPO
```

## 🚀 3. Отправить изменения на GitHub
```bash
git add .
git commit -m "Сообщение коммита"
git push origin main
```

## 🔄 4. Стянуть последние изменения на другом ПК
```bash
git pull origin main
```

## 🧹 5. Отменить локальные изменения и вернуть версию с GitHub
⚠️ Удалит все незакоммиченные и неотслеживаемые изменения:
```bash
git fetch origin
git reset --hard origin/main
git clean -fd
```

## 🌿 6. Работа с ветками

### 🪄 Создание новой ветки и переключение в неё:
```bash
git checkout -b имя_ветки
```
Пример:
```bash
git checkout -b feature/sidebar-enhance
```

### 🚀 Публикация новой ветки на GitHub:
```bash
git push -u origin имя_ветки
```

## 🔁 7. Слияние ветки в основную (main)
```bash
git checkout main
git pull origin main
git merge имя_ветки
git push origin main
```

## 🧼 8. Удаление ветки после слияния (опционально)

### 🔽 Локально:
```bash
git branch -d имя_ветки
```

### ☁️ На GitHub:
```bash
git push origin --delete имя_ветки
```

## 🔃 9. Переключение между ветками
```bash
git checkout имя_ветки
```

## 🔍 10. Просмотр веток

### 📍 Локальные ветки:
```bash
git branch
```

### ☁️ Удалённые ветки:
```bash
git branch -r
```

### 🔄 Все ветки (локальные + удалённые):
```bash
git branch -a
```

## 🔄 11. Переключиться на удалённую ветку, если локальной ещё нет
```bash
git checkout -b имя_ветки origin/имя_ветки
```

## 📦 12. Настройка глобального поведения Git

### Избавиться от LF/CRLF предупреждений:
```bash
git config --global core.autocrlf true
```

### Сделать VS Code редактором Git по умолчанию:
```bash
git config --global core.editor "code --wait"
```
