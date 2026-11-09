# ИНСТРУКЦИИ ЗА СЪЗДАВАНЕ НА ФУНИЯ – uni-arabian.eu (ConvertBuilder)

Това е пълният набор от правила, по които правим фуниите. Дай го на човек или AI, който ще прави нова фуния. Всичко тук е доказано в продукция.

---

## 1. Как е устроена една фуния

| Стъпка | Страница | Какво има на нея |
|---|---|---|
| 1 | **Лендинг** | Един HTML (code) блок с целия лендинг. Ако чекаутът е на същата страница, най-долу има още един code блок + checkout widget. |
| 2 | **Чекаут** | Един HTML (code) блок **точно над** checkout widget-а (шапка + дизайн на формата + въпроси под формата). Може да е най-долу на лендинга или на отделна страница. |
| 3 | **Ъпсел** (по желание) | Един HTML (code) блок + скрит widget „Upsell Button“ с продукта. |
| 4 | **Thank you** | Един HTML (code) блок. След 3 секунди пренасочва към Viber групата. |

**Препоръка:** чекаутът да е **най-долу на същата страница** като лендинга. Така няма зареждане на нова страница и по-малко хора се губят. Всички бутони тогава плъзгат надолу до формата.

---

## 2. Задължително във ВСЯКА фуния

1. **Неонови или анимирани рамки** – картите, цената, бутоните светят и сменят цвета си в цветовете на фунията.
2. **Бутон за поръчка след всяка секция.** Плюс залепена лента най-долу на телефона (показва се след първия екран, скрива се, когато стигнеш до чекаута).
3. **Само наложен платеж.** Методът е избран сам, другите методи се скриват.
4. **Отзиви** – секция „Какво казват клиентите“ с този iframe (потвърдени покупки) и бутон под нея:
   ```html
   <div class="ПРЕФИКС-otz" style="max-width:720px !important;margin:0 auto !important;border-radius:16px !important;overflow:hidden !important;background:#fff !important"><iframe src="https://potvardi.com/otzivi.php?k=97bc78218d48de8b&embed=1" title="Отзиви от клиенти" style="display:block !important;width:100% !important;height:520px !important;border:0 !important" loading="lazy"></iframe></div>
   ```
   **Никога** не се измислят отзиви, звезди, имена или „4.8/5 от 1600+ клиенти“.
5. **Комплектите се описват САМО като комплект.** Никъде „за шише“, „избери аромат“, „1 бр.“ и т.н. Цената винаги е „за целия комплект“.
6. **Без „AROMA BAY“** никъде в страниците.
7. **Без измислени стари цени и проценти отстъпка.** Зачертана цена или „−50%“ се слага само ако собственикът я е дал.
8. **Мобилен изглед на първо място.** Всичко се проверява на ширина 390px. Нищо не излиза извън екрана, бутоните са на един ред.

---

## 3. Технически правила (ConvertBuilder) – иначе страницата се чупи

1. **Кодът е фрагмент** – без `<html>`, `<head>`, `<body>`, `<!DOCTYPE>`. Фонът е на обвиващия блок (`<div id="ПРЕФИКС">`). Шрифтовете се зареждат с `@import` в `<style>`.
2. **Уникален префикс за всички класове** на фунията: `dh-`, `fz-`, `a5-`, `tr-`, `bf-`, `ebf-` … Платформата има свои класове (`.after`, `article{float:left}` и др.), които вече са чупили страници.
3. **`!important` на всяко CSS свойство** (и в `<style>`, и в inline `style=""`), **освен на анимираните**: `box-shadow`, `border-color`, `text-shadow`, `opacity`, `transform`, `clip-path`, `background-position` и CSS променливите `--нещо`. Ако анимираното свойство е с `!important`, анимацията замръзва.
   - За рамка, която се анимира: `border-width:2px !important; border-style:solid !important; border-color:#…;` (цветът без `!important`).
   - На елементите, които се появяват/изчезват с анимация (конфети, искри), `animation` също е без `!important`.
4. **Изключи float вътре във фунията:** `#ПРЕФИКС#ПРЕФИКС *{ float:none !important; }`
5. **`box-sizing:border-box`** за всички елементи, `img{max-width:100%; display:block}`, обвивката `overflow:hidden`.
6. **Бутоните към чекаута:**
   - Ако чекаутът е на друга страница: пълен адрес + `target="_top"` (напр. `https://uni-arabian.eu/checkout-…`).
   - Ако чекаутът е най-долу на същата страница: JS плъзга до него:
     ```js
     document.querySelectorAll('#ПРЕФИКС a.ПРЕФИКС-cta').forEach(function(a){
       a.addEventListener('click',function(e){
         var co=document.querySelector('.ПРЕФИКСc')||document.querySelector('.widget-checkout');
         if(co){ e.preventDefault(); co.scrollIntoView({behavior:'smooth',block:'start'});
           setTimeout(function(){ if(Math.abs(co.getBoundingClientRect().top)>40) co.scrollIntoView({behavior:'smooth',block:'start'}); },1200); }
       });
     });
     ```
     (Второто плъзгане е нужно, защото снимките над чекаута се зареждат при скрола и бутат страницата.)
7. **Бутоните да не се чупят на два реда** на телефон – `white-space:nowrap` или по-малък `letter-spacing` под 420px.
8. **Таймер (ако има):** истински, не се нулира при презареждане. Брои по часа в София (`Intl.DateTimeFormat` с `timeZone:'Europe/Sofia'`) до неделя 23:59:59 или до точна дата на кампанията.
9. **Снимки:** само от `content.app-sources.com/...` (качени в ConvertBuilder). Големите снимки с `loading="lazy"`, главната без.
10. **Viber бутон за поръчка (по желание):** `viber://chat?number=+359882667532`

---

## 4. Чекаутът – един код над checkout widget-а

Чекаут кодът се слага в **един HTML (code) блок точно над checkout widget-а** и съдържа:

1. **Шапка над формата** в стила на фунията: лента най-горе, стъпки (Комплект ✓ → Данни → Готово), заглавие „… почти твой“, карта с комплекта и цената, карта „Наложен платеж – плащаш при получаване“.
2. **Дизайн на самата форма (`.widget-checkout`)** – светъл скин (бели полета, тъмен текст) в акцентния цвят на фунията. Готовият шаблон е в Приложение А – сменят се само цветовете.
3. **Блок с въпроси и предимства**, който JS мести вътре в widget-а, под формата.
4. **JS, който:**
   - избира **наложен платеж** сам (`[data-payment="cod"] input` → click);
   - слага телефона на **България +359** (`intlTelInput … setCountry('bg')`);
   - скрива паролата/регистрацията, флагчето на телефона (`.iti__country-container`), бутона `next-step` и другите методи на плащане;
   - ако в тази фуния не трябва bump „продукт изненада“ – намира го **по текста** („изненада“) и го скрива (номерата на bump-овете са различни на всяка страница).

Цените и продуктът в чекаута се настройват в самия checkout widget в ConvertBuilder – кодът не може да ги промени. Името на продукта трябва да съвпада с офертата (а при „тайна“ оферта да не издава тайния продукт).

---

## 5. Ъпсел страница

- Слага се widget **„Upsell Button“** с продукта (той добавя продукта към поръчката) + един HTML блок с кода.
- Кодът скрива бутона на платформата, а нашият бутон „Да“ го натиска (`.upsell-positive-action`).
- След „Да“ (когато продуктът е добавен) и след „Не“ клиентът отива на thank you страницата (променливата `UP_THANK_YOU` в началото на скрипта).
- Общ ъпсел за всички фунии: Dirham Pink + Gold за 11.90 € (светъл). За Черния петък: „Продукт изненада за 4,50 €“.
- Има лента „✓ Поръчката ти е приета! Не затваряй страницата“, „ЧАКАЙ!“, оферта, 3 бутона „Да“ и линкове „Не, благодаря“, отзиви.

---

## 6. Thank you страница

- „Благодарим ти!“ + 3 стъпки (приета → изпращаме → плащаш при получаване) + блок с отброяване 3…2…1.
- **След 3 секунди пренасочва към Viber групата:**
  `https://invite.viber.com/?g2=AQAvRYvjcv%2FCQ1XLFSQG5T0d%2BOSA2yLvYeugV17e8hlaiHCEHehOeCG9Bl2RMAtV&lang=en`
- Може да е обща за много фунии (без имена на продукти).

---

## 7. Структура на лендинга (доказана)

1. **Лента най-горе** (движещ се текст): оферта • цена • „Плащаш при получаване“.
2. **Първи екран** – на телефон до бутона и иконките се вижда без скрол:
   заглавие → подзаглавие → главна снимка → цена „за целия комплект“ → голям бутон → 3 иконки (Плащаш при получаване • Доставка 1–3 дни • N бутилки по X ml).
3. **(По желание) таймер.**
4. **Какво има в комплекта** – карта за всеки парфюм: снимка, име, „100 ml · за него/нея“, 1 изречение, нотки (връх/сърце/база).
5. **Интерактивен блок** – нещо за игра: „отвори кутията“, колело, квиз, термометър „лед/огън“, „3 подсказки“.
6. **Сметката / защо е изгодно** (напр. 3 × 100 ml = 300 ml, ≈ 0,04 € на пръскане).
7. **Как работи** (поръчваш за 30 сек → SMS → отваряш и плащаш).
8. **За кого е** (за него, за нея, за подарък).
9. **Отзиви** (iframe-ът от т. 2).
10. **Въпроси (ЧЗВ)** – `<details>`: доставка 1–3 дни с Еконт (или Pigeon Express), наложен платеж, тест и преглед преди плащане, какво има в комплекта, трайност.
11. **Финален блок** – кратко обобщение + цената + бутон.
12. **Залепена лента на телефона** – „N парфюма – цена • ПОРЪЧАЙ“.

След всяка секция – бутон за поръчка (+ по желание Viber бутон).

**Тон на текста:** говорим на „ти“, кратко и конкретно, без празни суперлативи. Цифри (ml, брой, цена, дни). Подчертаваме: наложен платеж, преглед и тест преди плащане, бърза доставка.

---

## 8. Стил и дизайн

- Тъмен фон (черно/тъмнокафяво/тъмносиньо) + 1–2 акцентни цвята от продукта (злато, розово, кехлибар, лед/огън…).
- Заглавия с характерен шрифт (Cormorant Garamond, Playfair Display, Unbounded, Oswald, Russo One…), текст с Golos Text / Montserrat.
- Неонова рамка: `@keyframes`, които сменят `border-color` и `box-shadow` между цветовете на фунията (8–10 сек цикъл, различно закъснение за всяка карта).
- Бутони: градиент в акцентния цвят, лек „блясък“, който минава по бутона, пулсиране; текст с главни букви.
- Без коледни мотиви, освен ако не са поискани. За Черния петък: черно + червено + златно/жълто, ленти „BLACK FRIDAY“.

---

## 9. Проверка преди предаване (задължително)

На ширина **390px** (телефон) и **1280px** (компютър):
- [ ] нищо не излиза извън екрана (няма хоризонтален скрол);
- [ ] всички бутони са на един ред и водят където трябва (или плъзгат до чекаута);
- [ ] в чекаута се вижда **само** наложен платеж, телефонът е +359, няма парола/флагче;
- [ ] таймерът тече и не се нулира;
- [ ] отзивите (iframe) се зареждат;
- [ ] залепената лента се показва след първия екран и се скрива при чекаута;
- [ ] няма грешки в конзолата;
- [ ] навсякъде пише „комплект“, цената е „за целия комплект“, няма „AROMA BAY“, няма измислени отзиви.

---

## 10. Примерите (3-те най-успешни фунии)

Към инструкциите има кодовете на 3-те най-продаващи фунии, взети от живите страници:
1. **Eclat Vanilla + Humrah** (`/vanilla-humrah`) – лендинг; чекаутът е най-долу на същата страница (checkout widget с настройки на платформата).
2. **Humrah + Dkhoun + Saviour подарък** (`/humrah-dkhoun-saviour-gift`) – лента за смяна на подаръка + лендинг; чекаутът е най-долу на същата страница.
3. **5+1 подарък** – дамски (`/5-1` + чекаут `/checkout5-1`) и мъжки (`/5-1m`, лендинг + чекаут код на същата страница).

Внимание: примери 1 и 2 са по-стари и още имат **текстови отзиви с имена и звезди**. В нова фуния вместо тях слагай iframe-а с отзивите (т. 2).

## 11. Полезни неща за копиране

| Какво | Стойност |
|---|---|
| Отзиви (iframe) | `https://potvardi.com/otzivi.php?k=97bc78218d48de8b&embed=1` |
| Viber група (thank you) | `https://invite.viber.com/?g2=AQAvRYvjcv%2FCQ1XLFSQG5T0d%2BOSA2yLvYeugV17e8hlaiHCEHehOeCG9Bl2RMAtV&lang=en` |
| Viber чат за поръчка | `viber://chat?number=+359882667532` |
| Иконка Viber | `https://content.app-sources.com/s/698084040813523351/uploads/Images/%D0%BF%D0%B0%D1%80%D1%84%D1%8E%D0%BC%D0%B8_68-7309953.png?format=webp` |
| Куриери | Еконт (офис/адрес), Pigeon Express (офис/адрес), доставка 1–3 работни дни |
| Плащане | Само наложен платеж, преглед и тест преди плащане |

---

## Приложение А – CSS шаблон за дизайна на checkout widget-а

Замразен, тестван шаблон. **Сменят се само цветовите токени `{{...}}`** – селектори, размери и функционалните блокове не се пипат.

Как се избират цветовете:
- **Тема по фона на фунията:** светъл фон → светла тема (тъмен текст, бели полета); тъмен фон → тъмна тема (светъл текст, тъмни карти).
- `{{ACCENT}}` – цветът на бутоните/акцентите на фунията; `{{ACCENT_NOHASH}}` – същият без `#`; `{{ACCENT_RGB}}` – същият като `R, G, B`.
- `{{ACCENT_DARK}}` – четима версия на акцента за текст (по-тъмна при светла тема, по-светла при тъмна).
- `{{ACCENT_HOVER}}` – малко по-светъл за hover; `{{BUTTON_TEXT}}` – текстът на бутона (черен/бял според контраста).
- `{{TEXT}}` / `{{TEXT_RGB}}` – основният текст; `{{CARD_BG}}` – фон на картите; `{{INPUT_BG}}` – фон на полетата; `{{SOFT_BG}}` / `{{SOFT_BG_MID}}` – меки фонове.
- Червеното за грешки `#e25041` не се сменя.
- Накрая: не трябва да остане нито един `{{`.

```html
<style>
/* {{FUNNEL_NAME}} — Premium Checkout Override */
.widget-checkout .checkout-info[data-step="info"] {
  background: {{CARD_BG}} !important;
  border-radius: 16px !important;
  padding: 32px 28px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba({{ACCENT_RGB}},0.35) !important;
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
  color: {{TEXT}} !important;
}
.widget-checkout .checkout-info-inner {
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
  color: {{TEXT}} !important;
}
.widget-checkout .checkout-info h2,
.widget-checkout .checkout-info h3 {
  font-family: 'Georgia', serif !important;
  color: {{TEXT}} !important;
  font-size: 20px !important;
  font-weight: 400 !important;
  letter-spacing: 0.5px !important;
  margin: 0 0 18px 0 !important;
  padding: 0 0 12px 0 !important;
  border-bottom: 1px solid rgba({{ACCENT_RGB}},0.35) !important;
  line-height: 1.3 !important;
}
.widget-checkout .checkout-info h3::before {
  content: "\25C6  " !important;
  color: {{ACCENT}} !important;
  font-size: 13px !important;
  vertical-align: middle !important;
  margin-right: 6px !important;
}
.widget-checkout .checkout-info input[type="text"],
.widget-checkout .checkout-info input[type="email"],
.widget-checkout .checkout-info input[type="password"],
.widget-checkout .checkout-info input[type="tel"],
.widget-checkout .checkout-info input[type="number"],
.widget-checkout .checkout-info select {
  background: {{INPUT_BG}} !important;
  border: 1.5px solid rgba({{ACCENT_RGB}}, 0.45) !important;
  border-radius: 8px !important;
  padding: 14px 16px !important;
  font-size: 15px !important;
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
  color: {{TEXT}} !important;
  margin-bottom: 12px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
  width: 100% !important;
  box-sizing: border-box !important;
  height: auto !important;
  line-height: 1.4 !important;
}
.widget-checkout .checkout-info input:focus,
.widget-checkout .checkout-info select:focus {
  border-color: {{ACCENT}} !important;
  box-shadow: 0 0 0 3px rgba({{ACCENT_RGB}}, 0.25) !important;
  outline: none !important;
  background: {{INPUT_BG}} !important;
}
.widget-checkout .checkout-info input::placeholder {
  color: rgba({{TEXT_RGB}}, 0.4) !important;
  font-weight: 400 !important;
  opacity: 1 !important;
}
.widget-checkout .checkout-info select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath fill='%23{{ACCENT_NOHASH}}' d='M6 8L0 0h12z'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 16px center !important;
  background-size: 12px !important;
  padding-right: 40px !important;
}
.widget-checkout .checkout-info .input-row {
  display: flex !important;
  gap: 12px !important;
  margin-bottom: 0 !important;
}
.widget-checkout .checkout-info .input-row > * {
  flex: 1 !important;
}
.widget-checkout .checkout-steps {
  margin-bottom: 22px !important;
}
.widget-checkout .steps-breadcrumbs-inner {
  background: linear-gradient(90deg, {{SOFT_BG}} 0%, {{SOFT_BG_MID}} 50%, {{SOFT_BG}} 100%) !important;
  border: 1px solid rgba({{ACCENT_RGB}},0.35) !important;
  border-radius: 10px !important;
  padding: 14px 18px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
}
.widget-checkout .checkout-style-1 .checkout-step {
  color: rgba({{TEXT_RGB}}, 0.35) !important;
  font-weight: 600 !important;
  letter-spacing: 1.5px !important;
  text-transform: uppercase !important;
  font-size: 11px !important;
  border: none !important;
  padding: 0 !important;
}
.widget-checkout .checkout-style-1 .checkout-step.active {
  color: {{ACCENT_DARK}} !important;
}
.widget-checkout .checkout-steps svg {
  fill: rgba({{ACCENT_RGB}}, 0.6) !important;
  width: 18px !important;
  height: 18px !important;
}
.widget-checkout .login-question {
  font-size: 13px !important;
  color: rgba({{TEXT_RGB}}, 0.6) !important;
}
.widget-checkout .login-question a,
.widget-checkout .toggle-fields {
  color: {{ACCENT_DARK}} !important;
  font-weight: 600 !important;
  text-decoration: underline !important;
}
.widget-checkout .tick-wrapper.small {
  background: transparent !important;
  border: none !important;
  padding: 8px 0 !important;
  margin-bottom: 0 !important;
  font-size: 13px !important;
  color: rgba({{TEXT_RGB}}, 0.65) !important;
}
.widget-checkout .tick-wrapper.small input[type="checkbox"] {
  margin-right: 8px !important;
  accent-color: {{ACCENT}} !important;
}
.widget-checkout .payment-mehtods-wrapper .tick-wrapper {
  background: {{INPUT_BG}} !important;
  border: 1.5px solid rgba({{ACCENT_RGB}}, 0.45) !important;
  border-radius: 10px !important;
  padding: 16px 20px !important;
  margin-bottom: 12px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-size: 15px !important;
  color: {{TEXT}} !important;
  font-weight: 500 !important;
}
.widget-checkout .payment-mehtods-wrapper .tick-wrapper:hover {
  border-color: {{ACCENT}} !important;
  box-shadow: 0 5px 15px rgba({{ACCENT_RGB}}, 0.25) !important;
  transform: translateY(-1px) !important;
  background: rgba({{ACCENT_RGB}}, 0.06) !important;
}
.widget-checkout .payment-mehtods-wrapper .tick-wrapper input[type="radio"] {
  accent-color: {{ACCENT}} !important;
  width: 18px !important;
  height: 18px !important;
  cursor: pointer !important;
}
.widget-checkout .payment-mehtods-wrapper .tick-wrapper > span {
  flex: 1 !important;
}
.widget-checkout [data-role="next-step"],
.widget-checkout [data-role="continue"] {
  background: {{ACCENT}} !important;
  color: {{BUTTON_TEXT}} !important;
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  letter-spacing: 2.5px !important;
  text-transform: uppercase !important;
  border-radius: 14px !important;
  padding: 20px 32px !important;
  border: none !important;
  box-shadow: 0 18px 60px -20px rgba({{ACCENT_RGB}}, 0.6) !important;
  transition: all 0.3s ease !important;
  margin-top: 14px !important;
  display: block !important;
  text-align: center !important;
  text-decoration: none !important;
  cursor: pointer !important;
}
.widget-checkout [data-role="next-step"]:hover,
.widget-checkout [data-role="continue"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 25px 60px -15px rgba({{ACCENT_RGB}}, 0.7) !important;
  background: {{ACCENT_HOVER}} !important;
}
.widget-checkout [data-role="continue"] i {
  margin-left: 8px !important;
}
.widget-checkout [data-role="back"] {
  color: rgba({{TEXT_RGB}}, 0.55) !important;
  text-decoration: underline !important;
  font-size: 13px !important;
  margin-top: 14px !important;
  display: inline-block !important;
}
.widget-checkout [data-role="back"]:hover {
  color: {{ACCENT_DARK}} !important;
}
.widget-checkout .checkout-summary,
.widget-checkout .checkout-summary.cart-items-wrapper {
  background: {{CARD_BG}} !important;
  border-radius: 14px !important;
  padding: 28px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba({{ACCENT_RGB}},0.35) !important;
  margin-top: 25px !important;
  color: {{TEXT}} !important;
}
.widget-checkout .checkout-summary h3 {
  font-family: 'Georgia', serif !important;
  color: {{TEXT}} !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 0 18px 0 !important;
  letter-spacing: 0.5px !important;
}
.widget-checkout .checkout-summary h3::before {
  content: none !important;
}
.widget-checkout .cart-container .cart-labels {
  background: {{SOFT_BG}} !important;
  border: 1px solid rgba({{ACCENT_RGB}}, 0.25) !important;
  padding: 10px 14px !important;
  border-radius: 6px !important;
  margin-bottom: 12px !important;
}
.widget-checkout .cart-container .cart-labels span {
  font-size: 11px !important;
  letter-spacing: 1.5px !important;
  color: {{ACCENT_DARK}} !important;
  text-transform: uppercase !important;
  font-weight: 700 !important;
}
.widget-checkout .cart-container .product-info,
.widget-checkout .cart-container .product-info a {
  color: {{TEXT}} !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}
.widget-checkout .cart-container .qty,
.widget-checkout .cart-container .row-total {
  color: {{TEXT}} !important;
  font-size: 14px !important;
}
.widget-checkout .subtotal-wrapper {
  padding: 6px 0 !important;
}
.widget-checkout .subtotal-wrapper .subtotal {
  color: rgba({{TEXT_RGB}}, 0.6) !important;
  font-size: 14px !important;
}
.widget-checkout .subtotal-wrapper .subtotal-price {
  color: {{TEXT}} !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}
.widget-checkout .grand-total-wrapper {
  padding: 16px 0 8px 0 !important;
  border-top: 2px solid rgba({{ACCENT_RGB}}, 0.5) !important;
  margin-top: 10px !important;
}
.widget-checkout .grand-total-wrapper .subtotal {
  color: {{TEXT}} !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 1.5px !important;
}
.widget-checkout .grand-total-wrapper .subtotal-price.grand-total {
  color: {{ACCENT_DARK}} !important;
  font-family: 'Georgia', serif !important;
  font-size: 30px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
}
.widget-checkout .promo-code-toggle-btn {
  color: {{ACCENT_DARK}} !important;
  font-weight: 600 !important;
  text-decoration: underline !important;
  font-size: 13px !important;
  cursor: pointer !important;
}
.widget-checkout .discount-code-btn {
  background: rgba({{ACCENT_RGB}}, 0.12) !important;
  color: {{ACCENT_DARK}} !important;
  padding: 12px 20px !important;
  border: 1px solid rgba({{ACCENT_RGB}}, 0.5) !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
}
.widget-checkout .discount-code-btn:hover {
  background: {{ACCENT}} !important;
  color: {{BUTTON_TEXT}} !important;
}
.widget-checkout .secured-checkout-wrapper {
  margin-top: 22px !important;
  padding-top: 18px !important;
  border-top: 1px solid rgba({{ACCENT_RGB}}, 0.35) !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
}
.widget-checkout .secured-checkout-wrapper > div {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.widget-checkout .secured-checkout-wrapper svg {
  fill: {{ACCENT}} !important;
  width: 20px !important;
  height: 20px !important;
}
.widget-checkout .secured-checkout-wrapper span {
  color: rgba({{TEXT_RGB}}, 0.6) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}
.widget-checkout .store-policies a {
  color: {{ACCENT_DARK}} !important;
  font-size: 12px !important;
  text-decoration: underline !important;
  margin-right: 14px !important;
  display: inline-block !important;
  margin-bottom: 8px !important;
}
.widget-checkout .store-policies a:hover {
  color: {{ACCENT}} !important;
}
.widget-checkout .error-message {
  color: #e25041 !important;
  font-size: 13px !important;
  margin-top: 8px !important;
}
.widget-checkout .checkout-spinner {
  border-color: {{ACCENT}} !important;
}
.widget-checkout .free-shipping-bar {
  display: none !important;
}
/* Само Наложен платеж — скрий всички други методи на плащане */
.widget-checkout .payment-mehtods-wrapper .tick-wrapper {
  display: none !important;
}
.widget-checkout .payment-mehtods-wrapper .tick-wrapper[data-payment="cod"] {
  display: flex !important;
}
/* Скрий бутона "Следваща стъпка" — да остане само "Завърши поръчката" */
.widget-checkout [data-role="next-step"] {
  display: none !important;
}
/* Скрий всички полета за парола, login и регистрация */
.widget-checkout [data-role="member-login"],
.widget-checkout [data-role="password"],
.widget-checkout [data-role="password-fields"],
.widget-checkout [data-role="login-btn"],
.widget-checkout [data-role="prompt-login"],
.widget-checkout .password-fields-wrapper,
.widget-checkout .checkout-info input[type="password"] {
  display: none !important;
}
/* Скрий country selector / флагче към телефонния номер */
.iti__flag,
.iti__flag-container,
.iti__selected-flag,
.iti__arrow,
.iti__country-list,
.iti__dropdown-content,
.iti--allow-dropdown .iti__flag-container,
.iti--separate-dial-code .iti__selected-flag,
.intl-tel-input .flag-container,
.intl-tel-input .selected-flag,
.intl-tel-input .country-list,
.intl-tel-input .flag,
.intl-tel-input .iti-flag,
.intl-tel-input .arrow,
select[name="phoneCountry"],
select[name="phoneCountryCode"],
select[name="phone_country"],
select[name="phoneCountryIso"],
.phone-country-select,
.phone-country-wrapper,
.phone-flag-wrapper,
.country-flag,
.country-code-select,
.flag-dropdown,
[class*="country-flag"],
[class*="phoneCountry"],
[class*="phone-country"],
[class*="phone-flag"] {
  display: none !important;
}
.widget-checkout input[type="tel"]::before,
.widget-checkout input[type="tel"] + *::before,
.widget-checkout .iti::before,
.widget-checkout .intl-tel-input::before {
  content: none !important;
  display: none !important;
}
.widget-checkout .iti,
.widget-checkout .intl-tel-input,
.widget-checkout .iti--allow-dropdown,
.widget-checkout .iti--separate-dial-code {
  width: 100% !important;
  display: block !important;
  padding-left: 0 !important;
}
.widget-checkout .iti input[type="tel"],
.widget-checkout .iti input.phone-input,
.widget-checkout .intl-tel-input input[type="tel"],
.widget-checkout .iti--allow-dropdown input[type="tel"],
.widget-checkout .iti--separate-dial-code input[type="tel"],
.widget-checkout input[type="tel"] {
  padding-left: 16px !important;
  margin-left: 0 !important;
  width: 100% !important;
  position: static !important;
  background-image: none !important;
}
@media screen and (max-width: 768px) {
  .widget-checkout .checkout-info[data-step="info"] {
    padding: 22px 18px !important;
    border-radius: 12px !important;
  }
  .widget-checkout .checkout-summary {
    padding: 22px 18px !important;
  }
  .widget-checkout .checkout-info h3 {
    font-size: 18px !important;
  }
  .widget-checkout .grand-total-wrapper .subtotal-price.grand-total {
    font-size: 26px !important;
  }
  .widget-checkout [data-role="next-step"],
  .widget-checkout [data-role="continue"] {
    padding: 18px 24px !important;
    font-size: 14px !important;
    letter-spacing: 2px !important;
  }
}
@media screen and (max-width: 480px) {
  .widget-checkout .checkout-info .input-row {
    flex-direction: column !important;
    gap: 0 !important;
  }
  .widget-checkout .steps-breadcrumbs-inner {
    padding: 10px 14px !important;
    gap: 8px !important;
  }
  .widget-checkout .checkout-style-1 .checkout-step {
    font-size: 10px !important;
    letter-spacing: 1px !important;
  }
}
</style>
```
