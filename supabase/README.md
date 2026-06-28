# Supabase AVL 84

Папка содержит серверную часть проекта: миграции PostgreSQL, политики доступа, seed-данные, описание Storage и Edge Functions.

## Структура

```text
supabase/
  migrations/   SQL-миграции БД
  seed/         тестовые/стартовые данные
  policies/     пояснения и дополнительные RLS-заметки
  storage/      структура bucket'ов и правила файлов
  functions/    Edge Functions
```

## Текущий технический контур

Миграции создают и дополняют:

- пользователей приложения;
- профили водителей;
- машины;
- справочники;
- заявки;
- назначения нескольких водителей на одну заявку через `public.order_assignments`;
- смены;
- рейсы;
- документы;
- OCR-результаты;
- отчетные таблицы, расходы и управленческую ставку заявки;
- уведомления;
- audit log;
- RLS-политики для ролей `admin`, `operator`, `driver`;
- private Storage bucket `documents` для ТТН и связанных файлов.

## Важное правило

Права водителя должны контролироваться на уровне БД через RLS. UI-ограничения считаются только дополнительной защитой, но не основным механизмом безопасности.

## Интеграционный запуск Supabase

### 1. Подготовить проект

1. Создать Supabase-проект.
2. В Supabase Auth создать тестовых пользователей:
   - `admin@avl84.local` - роль будет задана в `public.users` как `admin`;
   - `driver1@avl84.local` - водитель Иванов;
   - `driver2@avl84.local` - водитель Петров.
3. Скопировать их реальные `auth.users.id`.
4. В `supabase/seed/001_dev_seed.sql` временно заменить UUID в `dev_seed_ids` на реальные ID.

Секреты, пароли и production-данные в репозиторий не добавлять.

### 2. Применить миграции

Через Supabase CLI или SQL Editor применить файлы из `supabase/migrations/` строго по имени/порядку:

```text
20260526193000_init_core_schema.sql
20260526194000_reporting_and_expenses_schema.sql
20260527193000_add_admin_rate_per_unit_to_orders.sql
20260527201000_driver_orders_safe_view.sql
20260528075000_storage_trip_document_policies.sql
20260531045000_sync_auth_users_to_public_profiles.sql
20260531052000_order_assignments_multi_driver.sql
20260531053000_user_email_and_create_driver_support.sql
20260613185100_lock_driver_submitted_trips_and_closed_shifts.sql
```

Краткое назначение поздних миграций:

- `20260531045000_sync_auth_users_to_public_profiles.sql` - синхронизация Auth-пользователей с `public.users`.
- `20260531052000_order_assignments_multi_driver.sql` - таблица `order_assignments`, RLS для назначений и видимость заявок назначенным водителям.
- `20260531053000_user_email_and_create_driver_support.sql` - email в профиле и поддержка создания водителя.
- `20260613185100_lock_driver_submitted_trips_and_closed_shifts.sql` - запрет редактирования водителем отправленных рейсов/закрытых смен и завершение RLS-адаптации multi-driver для машин и создания рейсов.

После миграций применить:

```text
supabase/seed/001_dev_seed.sql
```

### 3. Запустить React/Vite-приложение с реальным backend

Из папки `app/` установить зависимости и запустить приложение:

```bash
npm i
npm run dev
```

Для подключения живого Supabase создать `app/.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Если `.env` не задан или содержит placeholder-значения, приложение остается в mock-режиме.

### 4. Проверить RLS вручную

Шаблон SQL-проверок лежит в:

```text
supabase/tests/rls_smoke_checks.sql
```

Его нужно запускать в SQL Editor после замены UUID на реальные ID тестовых пользователей.

## Ставки в заявке

В заявке хранятся две разные ставки:

- `driver_rate_per_trip` - ставка водителя за рейс, может отображаться водителю;
- `admin_rate_per_unit` - управленческая ставка за перевезенную единицу (`ton`/`m3`), используется в отчетах руководителя и не должна показываться водителю.

## RLS-сценарии, которые должны сохраняться

- Водитель видит заявку, если он назначен через legacy-поля `orders.assigned_driver_id` или через `order_assignments`.
- Водитель может создать рейс только по активной заявке (`assigned`/`in_progress`), своей назначенной машине и открытой смене.
- Водитель может загрузить и увидеть документы по своему рейсу/смене; Storage-путь ТТН: `trips/{tripId}/ttn/...`.
- Водитель не может редактировать отправленный рейс: корректировки выполняют `admin`/`operator`.
- Водитель может закрыть свою открытую смену переводом в `submitted`, но не может править закрытую смену.
