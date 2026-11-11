# Правила за фуниите (ConvertBuilder · uni-arabian.eu)

## Отзиви — слагат се във ВСЯКА фуния (лендинг и ъпсел)
- Секция „Какво казват клиентите“ с този iframe (потвърдени покупки от potvardi.com) и бутон под нея като всяка друга секция:
  `<iframe src="https://potvardi.com/otzivi.php?k=97bc78218d48de8b&embed=1" style="width:100%;height:520px;border:0" loading="lazy"></iframe>`
  Обвива се в `<div class="{префикс}-otz">` с бял фон и заоблени ъгли (max-width 720px); на iframe-а `display:block`.
- Не се измислят други отзиви, звезди или имена.
- Старите 12 скрийншота от Facebook/Viber са в `funnels/_shared/reviews.json` (`.gitignore` игнорира `*.json` – за този файл има изключение). Ползват се само ако изрично се поискат.

## Технически правила (доказани в продукция)
- Код = фрагмент без `<html>/<head>/<body>`; фонът е на обвиващия блок; шрифтове с `@import`.
- Всички класове с уникален префикс на фунията (`dh-`, `fz-` …) — иначе се бият с CSS-а на платформата
  (`.after` и `article{float:left}` вече са чупили страници).
- `!important` на всичко, освен на анимираните свойства (box-shadow, border-color, text-shadow,
  opacity, transform, clip-path) — иначе анимацията замръзва. Изключи и `float` вътре във фунията.
- Бутоните към чекаута: пълен URL + `target="_top"`; бутон след всяка секция. Ако чекаутът е най-долу на същата страница (напр. `5-1m`), бутоните плъзгат до него (`.a5c`/`.widget-checkout`).
- Чекаут = един код над checkout widget-а: шапка + светъл скин (`.widget-checkout`) + блок с
  въпроси, който JS мести вътре в widget-а. Само наложен платеж (избран сам), скрити парола/флагче,
  телефон +359 (`.iti__country-container` също се скрива).
- Комплектите се описват САМО като комплект — никъде „за шише“, „избери аромат“ и т.н.
- Thank you: Viber пренасочване след 3 сек (линкът е в `funnels/freeze-in-flames/thank-you-freeze.src.html`).
- Thank you за Черния петък (обща за всички BF оферти): `funnels/early-bf-humrah/thank-you-ebf.src.html`.
- Ъпсел (общ за всички фунии): `funnels/upsell/upsell-dirham.src.html` – светъл; „Да“ натиска скрития widget „Upsell Button“ (`.upsell-positive-action`) и води към `/ty`, „Не“ → `/ty`.
- Ъпсел Humrah + Buni 50 ml за 11.90 €: `funnels/upsell-humrah-buni/upsell-humrah-buni.src.html` – като общия ъпсел, в кехлибарени цветове.
- Ъпсел за Черния петък „Продукт изненада 4,50 €“ (общ за BF): `funnels/early-bf-humrah/upsell-surprise.src.html` – същата механика (скрит „Upsell Button“ с продукта изненада).
- Готовите фунии: `funnels/dirham-pink-gold/`, `funnels/freeze-in-flames/`, `funnels/men-5/`, `funnels/trio/`, `funnels/black-friday-mystery/`, `funnels/early-bf-humrah/`.
