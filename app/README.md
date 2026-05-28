# AVL 84 Flutter App

Flutter-клиент для внутренней системы управления перевозками AVL 84.

## Назначение

Один Flutter-проект покрывает:

- Android-приложение водителя;
- Flutter Web-кабинет руководителя;
- общую навигацию, тему, модели и доступ к Supabase.

## Статус

Flutter SDK сейчас не найден в окружении, поэтому папка содержит подготовленный каркас проекта вручную. После установки Flutter нужно выполнить:

```bash
flutter pub get
flutter analyze
flutter test
```

Если потребуется полностью сгенерировать platform-папки, можно выполнить из этой папки:

```bash
flutter create . --platforms=android,web
```

После генерации важно не потерять уже подготовленную структуру `lib/`.

## Запуск с Supabase

Конфигурация читается через `--dart-define`:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

Если значения не переданы, приложение работает в dev-режиме: на экране входа доступны кнопки входа как руководитель или водитель без подключения к Supabase.

## Auth flow

Подготовлено:

- `AppConfig` для чтения окружения;
- `Supabase.initialize` в `bootstrap.dart`;
- `AuthRepository`;
- `AuthController` на Riverpod;
- role-based redirect в `go_router`;
- dev-вход для проверки shell'ов без backend.

## Структура

```text
lib/
  app/          bootstrap, app widget, router, theme, DI
  core/         общие константы, ошибки, сервисы, утилиты, виджеты
  features/     функциональные модули
  shared/       общие модели, providers, repositories
```

## Первый сквозной сценарий

```text
admin creates order
-> assigns driver and vehicle
-> driver sees order
-> driver submits trip report with TTN photo
-> driver closes shift
-> admin sees trips, shifts and documents
-> admin exports trips table
```
