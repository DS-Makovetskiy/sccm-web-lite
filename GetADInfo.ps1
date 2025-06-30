# Импорт модуля Active Directory
Import-Module ActiveDirectory

# Путь до файла
$excelFilePath = "C:\apps\SCCM_Connect\data\AD_Data.xlsx"

# Проверка на наличие файла в директории, если файла нет, создается новый
if (-not (Test-Path $excelFilePath)) {
    # Создание нового Excel файла
    $excel = New-Object -ComObject Excel.Application
    $workbook = $excel.Workbooks.Add()
    # Добавление листов в книгу
    $computersSheet = $workbook.Worksheets.Add()
    $computersSheet.Name = "Computers"
    $usersSheet = $workbook.Worksheets.Add()
    $usersSheet.Name = "Users"
    # Сохранение Excel файла
    $workbook.SaveAs($excelFilePath)
    # Закрытие Excel файла
    $workbook.Close()
    $excel.Quit()

}

# Открытие файла Excel
$excel = New-Object -ComObject Excel.Application
$workbook = $excel.Workbooks.Open($excelFilePath)

# Очистка старых данных на листе Computers
$worksheet = $workbook.Sheets.Item("Computers")
$worksheet.Cells.Clear()


# Определение подразделения пользователя
$currentUser = $env:USERNAME
$userInfo = Get-ADUser -Identity $currentUser -Properties Office
$office = $userInfo.Office

# Получения списка компьютеров из AD для текущего подразделения
$computers = Get-ADComputer -SearchBase "OU=Computers,OU=$office,OU=Structural_units_of_the_bank,DC=bank,DC=corp,DC=centercredit,DC=kz" -filter {Enabled -eq "True"} -Properties IPV4Address, Description, OperatingSystem, OperatingSystemVersion, LastLogonDate | sort-object IPV4Address | select-object Name, IPV4Address, Description, OperatingSystem, OperatingSystemVersion, LastLogonDate

# Формирование таблицы с данными по компьютерам
$startRow = 2
foreach ($computer in $computers) {
    $worksheet.Cells.Item(1, 1) = "Name"
    $worksheet.Columns.Item(1).NumberFormat = "@"
    $worksheet.Cells.Item(1, 2) = "IPV4Address"
    $worksheet.Cells.Item(1, 3) = "Description"
    $worksheet.Cells.Item(1, 4) = "OperatingSystem"
    $worksheet.Cells.Item(1, 5) = "OperatingSystemVersion"
    $worksheet.Cells.Item(1, 6) = "LastLogonDate"
    $worksheet.Cells.Item($startRow,1) = $computer.Name
    $worksheet.Cells.Item($startRow,2) = $computer.IPV4Address
    $worksheet.Cells.Item($startRow,3) = $computer.Description
    $worksheet.Cells.Item($startRow,4) = $computer.OperatingSystem
    $worksheet.Cells.Item($startRow,5) = $computer.OperatingSystemVersion
    $worksheet.Cells.Item($startRow,6) = $computer.LastLogonDate
    $startRow++
}


# Очистка старых данных на листе Users
$worksheet2 = $workbook.Sheets.Item("Users")
$worksheet2.Cells.Clear()

# Получения списка пользователей из AD для текущего подразделения
$users = Get-ADUser -SearchBase "OU=Users,OU=$office,OU=Structural_units_of_the_bank,DC=bank,DC=corp,DC=centercredit,DC=kz" -filter * -Properties Name, Description, DisplayName, EmailAddress, LastLogonDate, MobilePhone, Office, OfficePhone, Title | sort-object DisplayName | select-object Name, Description, DisplayName, EmailAddress, LastLogonDate, MobilePhone, Office, OfficePhone, Title

# Формирование таблицы с данными по пользователям
$startRow = 2
foreach ($user in $users) {
    $worksheet2.Cells.Item(1, 1) = "DisplayName"
    $worksheet2.Cells.Item(1, 2) = "Title"
    $worksheet2.Cells.Item(1, 3) = "Description"
    $worksheet2.Cells.Item(1, 4) = "MobilePhone"
    $worksheet2.Columns.Item(4).NumberFormat = "@"
    $worksheet2.Cells.Item(1, 5) = "EmailAddress"
    $worksheet2.Cells.Item(1, 6) = "Name"
    $worksheet2.Cells.Item(1, 7) = "Office"
    $worksheet2.Cells.Item(1, 8) = "LastLogonDate"
    $worksheet2.Cells.Item($startRow,1) = $user.DisplayName
    $worksheet2.Cells.Item($startRow,2) = $user.Title
    $worksheet2.Cells.Item($startRow,3) = $user.Description
    $worksheet2.Cells.Item($startRow,4) = $user.MobilePhone
    $worksheet2.Cells.Item($startRow,5) = $user.EmailAddress
    $worksheet2.Cells.Item($startRow,6) = $user.Name
    $worksheet2.Cells.Item($startRow,7) = $user.Office
    $worksheet2.Cells.Item($startRow,8) = $user.LastLogonDate
    $startRow++
}


# Сохранение файла Excel
$workbook.Save()

# Закрытие файла Excel
$workbook.Close()
$excel.Quit()


# Оповещение о завершении работы скрипта
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon

# Выбор иконки для оповещения
$icon = [System.Drawing.SystemIcons]::Information
$notifyIcon.Icon = $icon

# Текст оповещения
$notifyIcon.Text = "Запрос данных из AD выполнен успешно"

# Показать всплывающую подсказку
$notifyIcon.BalloonTipTitle = "Запрос данных из AD выполнен успешно"
$notifyIcon.BalloonTipText = "Информация обновлена"
$notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notifyIcon.Visible = $true
$notifyIcon.ShowBalloonTip(5000)

# Удаление объекта оповещения
$notifyIcon.Dispose()