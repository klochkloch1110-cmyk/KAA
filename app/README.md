# AVL 84 App

Основное приложение AVL 84 на React/Vite. За основу взят макет из Figma Make: интерфейс панели руководителя и мобильного приложения водителя теперь является главной кодовой базой в папке `app/`.

Оригинальный Figma-проект:
https://www.figma.com/design/gijCsfYKdyGTATp1uYvY2t/%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BF%D0%BE-%D0%A2%D0%97

## Назначение папки

Папка `app/` больше не содержит Flutter-код. Дальнейшая разработка ведется здесь, поверх React/Vite-макета.

Ближайший инженерный фокус:
- привести сгенерированный UI-код к рабочей архитектуре приложения;
- подключить реальные данные и Supabase API;
- реализовать первый сквозной сценарий: заявка -> рейс -> фото ТТН -> смена -> выгрузка;
- сохранить визуальный стиль макета как основной продуктовый UI.

## Структура

- `src/app/App.tsx` - главный экран прототипа и переключение между панелью руководителя и приложением водителя.
- `src/app/components/` - экраны и компоненты прототипа.
- `src/app/components/ui/` - сгенерированные UI-компоненты.
- `src/imports/` - изображения и вставленные материалы из Figma Make.
- `src/styles/` - стили, тема, Tailwind-настройки.
- `public/` - публичные ассеты прототипа.

## Запуск

Из этой папки:

```bash
npm i
npm run dev
```

Сборка:

```bash
npm run build
```

## Данные и Supabase

По умолчанию приложение работает в `mock-режиме`: данные хранятся в общем клиентском сторе и не требуют внешних ключей.

Для подготовки Supabase-подключения создайте `.env` рядом с `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Если значения не заданы или оставлены placeholder'ами, приложение автоматически остается в mock-режиме.

В mock-режиме на экране входа доступны быстрые кнопки:

- `Руководитель` - открывает web-панель админа;
- `Водитель` - открывает мобильный интерфейс водителя.

После подключения Supabase вход будет идти через `Supabase Auth`, а роль будет читаться из таблицы `public.users`.

Ключевые файлы слоя данных:

- `src/app/auth/AuthProvider.tsx` - состояние авторизации и текущий пользователь;
- `src/app/repositories/authRepository.ts` - mock/Supabase-ready вход и выход;
- `src/app/store/AppStore.tsx` - общий стор текущего приложения;
- `src/app/config/env.ts` - чтение переменных окружения;
- `src/app/services/supabaseClient.ts` - безопасная инициализация Supabase-клиента;
- `src/app/repositories/operationsRepository.ts` - интерфейс репозитория под будущую замену mock-операций на Supabase.

Или с pnpm, если он установлен:

```bash
pnpm i
pnpm dev
```

## Источник макета

Оригинальный Figma-проект:
https://www.figma.com/design/gijCsfYKdyGTATp1uYvY2t/%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BF%D0%BE-%D0%A2%D0%97
