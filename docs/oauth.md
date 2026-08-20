# Издаване на refresh token (еднократно)

Нужно е веднъж. Token-ът не изтича, стига приложението да е в **In production**
(в *Testing* изтича след 7 дни) и да се ползва поне веднъж на 6 месеца.

Имаш нужда от `client_id` и `client_secret` на OAuth клиент от тип **Desktop app**.

## 1 · Вземи код за оторизация

Отвори този URL в браузър, като замениш `CLIENT_ID`:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=CLIENT_ID&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent
```

Влез с акаунта, който притежава папката, и разреши достъпа.

Ако приложението не е верифицирано, Google показва предупредителен екран →
**Advanced** → **Go to … (unsafe)**. Това е нормално за собствено приложение.

Браузърът ще те прехвърли към `http://localhost/?code=4/0A…&scope=…`.
Страницата няма да се зареди — това е очаквано. **Кодът е в адресната лента.**
Копирай стойността на `code=` до първото `&`.

Кодът е валиден няколко минути и се използва само веднъж.

## 2 · Размени кода за refresh token

PowerShell:

```powershell
$r = Invoke-RestMethod -Method Post -Uri "https://oauth2.googleapis.com/token" -Body @{
  code          = "ЗАЛЕПИ_КОДА"
  client_id     = "CLIENT_ID"
  client_secret = "CLIENT_SECRET"
  redirect_uri  = "http://localhost"
  grant_type    = "authorization_code"
}
$r.refresh_token
```

bash:

```bash
curl -s https://oauth2.googleapis.com/token \
  -d code=ЗАЛЕПИ_КОДА \
  -d client_id=CLIENT_ID \
  -d client_secret=CLIENT_SECRET \
  -d redirect_uri=http://localhost \
  -d grant_type=authorization_code
```

Отговорът съдържа `refresh_token`. Това е стойността за секрета
`GOOGLE_OAUTH_REFRESH_TOKEN`.

## Ако липсва refresh_token в отговора

Google го връща само при **първо** съгласие за дадена комбинация приложение +
акаунт. Ако вече си давал съгласие, отговорът съдържа само `access_token`.

Решението е `prompt=consent` в URL-а от стъпка 1 (вече е там) — то принуждава
Google да издаде нов refresh token. Ако пак не се появи, оттегли достъпа от
[myaccount.google.com/permissions](https://myaccount.google.com/permissions)
и повтори.

## Проверка

```bash
node -e "import('./src/drive.mjs').then(async m=>{
  const d=m.driveClient({clientId:process.env.GOOGLE_OAUTH_CLIENT_ID,clientSecret:process.env.GOOGLE_OAUTH_CLIENT_SECRET,refreshToken:process.env.GOOGLE_OAUTH_REFRESH_TOKEN});
  console.log(await m.ensureFolder(d, process.env.DRIVE_PARENT_FOLDER_ID, 'проба'));
})"
```

Ако върне ID на папка, достъпът работи.

## Защо `drive.file`, а не `drive`

`drive` е „ограничен" scope при Google — иска верификация на приложението и
показва предупредителен екран. `drive.file` не е ограничен: минава без преглед.

По-важното е обхватът. Refresh token-ът живее в GitHub секретите на публично
репо. Със `drive` изтичане би дало достъп до целия Drive; със `drive.file` —
само до файловете, които приложението самó е създало.

Ограничението: приложението **не вижда** чужди файлове. Затова `ensureFolder`
не може да намери папка, създадена извън него — при първи пуск просто създава
своя, а следващите пускове я намират. Родителската папка `ad-formats` се ползва
само като адрес при създаване, което `drive.file` позволява.

Ако Drive върне 403/404 за родителската папка, върни `drive` в Data Access и
преиздай token-а.
