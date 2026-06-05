# GiftOS v7 · Production Feel Edition

Персональная мобильная веб-апка для выбора подарка.

## Что внутри

- PWA manifest: сайт можно добавить на экран iPhone как приложение.
- Модульная структура: `data`, `state`, `views`, `services`, `utils`.
- Onboarding перед выбором.
- Step-flow: Direction → Variant → Details → Confirmation.
- Wishlist mode с полями для ссылки, размера, цвета и комментария.
- Финальный экран с подготовкой к Telegram/API.

## Как залить на GitHub/Vercel

Заменить файлы в репозитории на содержимое этой папки. Vercel сам пересоберёт проект.

## Где менять тексты

`src/data/catalog.js`

## Где позже подключать Telegram Bot

`src/services/submissionService.js`
