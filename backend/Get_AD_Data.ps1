Import-Module ActiveDirectory

# Путь к выходным файлам
$usersOutput = ".\ad_users.csv"
$computersOutput = ".\ad_computers.csv"

# --- Получение пользователей из группы G_S_USERS_PVL ---
$groupName = "G_S_USERS_PVL"
$group = Get-ADGroup -Identity $groupName -ErrorAction Stop

# Получаем только нужные атрибуты для производительности
$users = Get-ADGroupMember -Identity $groupName -Recursive |
    Where-Object { $_.objectClass -eq "user" } |
    ForEach-Object {
        Get-ADUser $_.DistinguishedName -Properties DisplayName, SamAccountName, Enabled, Department, Title
    } |
    Select-Object Name, SamAccountName, Enabled, DisplayName, Department, Title

# Сохраняем в CSV
$users | Export-Csv -Path $usersOutput -NoTypeInformation -Encoding UTF8

# --- Получение списка компьютеров ---
# Для снижения нагрузки фильтруем только включенные компьютеры
$computers = Get-ADComputer -Filter 'Enabled -eq $true' -Properties Name, OperatingSystem, LastLogonDate |
    Select-Object Name, OperatingSystem, LastLogonDate

# Сохраняем в CSV
$computers | Export-Csv -Path $computersOutput -NoTypeInformation -Encoding UTF8
