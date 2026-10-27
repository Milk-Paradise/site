# Telegram: заявки в вашу группу

Форма отправляет заявки через Telegram Bot API, когда указан токен, ID чата и включён PRIVACY_READY. До проверки политики флаг остаётся выключенным.

## 1. Создайте бота

Откройте официальный https://t.me/BotFather. Отправьте `/newbot`, задайте отображаемое имя и свободное имя пользователя, заканчивающееся на `bot`. BotFather выдаст токен. Храните его как пароль, не отправляйте в чат и не добавляйте в Git. При утечке перевыпустите через BotFather.

## 2. Добавьте в группу

В нужной группе откройте список участников → «Добавить участника», найдите созданного бота по имени пользователя и добавьте. Для обычной группы достаточно права отправлять сообщения; делать бота администратором и отключать Privacy Mode для отправки заявок не требуется.

Для простоты сначала используйте группу без тем. Для группы с темами дополнительно понадобится `message_thread_id` нужной темы.

## 3. Получите ID группы

Отправьте в группе команду `/start@имя_вашего_бота`. На своём компьютере откройте PowerShell и выполните:

```powershell
$botSecret = Read-Host 'Токен бота' -AsSecureString
$botCredential = [System.Net.NetworkCredential]::new('', $botSecret)
$botApiBase = 'https://api.telegram.org/bot' + $botCredential.Password
$botUpdates = Invoke-RestMethod -Uri ($botApiBase + '/getUpdates') -Method Post
$botUpdates.result | ForEach-Object {
    if ($_.message.chat) {
        $_.message.chat | Select-Object id, title, type
    }
}
```

Найдите группу по названию. Скопируйте её `id` целиком, включая минус. Если результат пустой, ещё раз отправьте команду с точным именем бота и повторите запрос. Обновления Telegram хранит не дольше 24 часов. Для нового бота webhook отсутствует; если он уже используется другим сервисом с webhook, `getUpdates` не сработает — не отключайте чужую интеграцию без проверки.

## 4. Проверьте доставку

В том же окне PowerShell выполните:

```powershell
$groupChatId = Read-Host 'ID группы целиком'
$testResult = Invoke-RestMethod -Uri ($botApiBase + '/sendMessage') -Method Post -Body @{
    chat_id = $groupChatId
    text = 'Проверка подключения Milkshake Studio'
}
$testResult.ok
Remove-Variable botSecret, botCredential, botApiBase
```

Ожидается `True` и сообщение в группе. Выполняйте проверку локально: не присылайте вывод ошибок с URL, поскольку URL API содержит токен.

## 5. Подключите к сайту на этапе формы

В локальном серверном `.env` будут нужны:

```dotenv
TELEGRAM_BOT_TOKEN=токен_от_BotFather
TELEGRAM_CHAT_ID=отрицательный_ID_группы
```

Эти переменные нельзя делать публичными (`NEXT_PUBLIC_`). Сервер Next.js будет отправлять заявки через `sendMessage`. Отдельная постоянно работающая программа бота, webhook и получение входящих сообщений для этого сценария не нужны. После изменения `.env` сервер необходимо перезапустить.

Официальные источники: [создание бота](https://core.telegram.org/bots/tutorial), [Bot API: getUpdates и sendMessage](https://core.telegram.org/bots/api), [режим приватности](https://core.telegram.org/bots/faq#what-messages-will-my-bot-get).
