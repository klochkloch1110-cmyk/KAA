# AVL 84 - Supabase integration runbook

Этот файл нужен для первого подключения живого Supabase-проекта к React/Vite-приложению и проверки RLS.

## 1. Что нужно заранее

- Supabase project URL.
- Supabase anon key.
- Доступ к Supabase SQL Editor.
- 3 тестовых пользователя в Supabase Auth:
  - `admin@avl84.local`;
  - `driver1@avl84.local`;
  - `driver2@avl84.local`.

Пароли, service-role key и реальные production-данные в репозиторий не добавлять.

## 2. Порядок применения SQL

В SQL Editor применить миграции строго по порядку:

```text
supabase/migrations/20260526193000_init_core_schema.sql
supabase/migrations/20260526194000_reporting_and_expenses_schema.sql
supabase/migrations/20260527193000_add_admin_rate_per_unit_to_orders.sql
supabase/migrations/20260527201000_driver_orders_safe_view.sql
supabase/migrations/20260528075000_storage_trip_document_policies.sql
supabase/migrations/20260531045000_sync_auth_users_to_public_profiles.sql
supabase/migrations/20260531052000_order_assignments_multi_driver.sql
supabase/migrations/20260531053000_user_email_and_create_driver_support.sql
supabase/migrations/20260613185100_lock_driver_submitted_trips_and_closed_shifts.sql
```

Важные смысловые точки порядка:

- `order_assignments_multi_driver` добавляет назначения нескольких водителей и расширяет видимость заявок.
- `lock_driver_submitted_trips_and_closed_shifts` должен применяться после `order_assignments_multi_driver`, потому что дополняет RLS создания рейсов через `order_assignments` и блокирует правку отправленных рейсов/закрытых смен водителем.

Затем открыть `supabase/seed/001_dev_seed.sql`, заменить placeholder UUID в `dev_seed_ids` на реальные `auth.users.id` и применить seed.

## 3. Запуск приложения

Из папки `app/`:

```bash
npm i
npm run dev
```

Для подключения живого Supabase создайте `app/.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Если `.env` не задан или содержит placeholder-значения из `.env.example`, приложение остается в mock-режиме.

## 4. Ручная проверка сценария 0.1

1. Войти админом.
2. Проверить dashboard, заявки, рейсы, смены, документы.
3. Создать или открыть заявку и назначить одного или нескольких водителей.
4. Войти водителем.
5. Проверить, что водитель видит свою назначенную заявку, включая назначение через `order_assignments`.
6. Открыть смену по назначенной машине.
7. Создать рейсовый отчет с номером ТТН, объемом и фото.
8. Убедиться, что повторное редактирование отправленного рейса водителю недоступно на уровне RLS/API.
9. Вернуться админом.
10. Проверить, что рейс появился в журнале.
11. Проверить, что документ появился в разделе `Документы`.
12. Открыть файл ТТН через signed URL.
13. Закрыть смену водителем.
14. Убедиться, что закрытая смена больше не редактируется водителем, но доступна staff-корректировкам.
15. Проверить журнал смен и CSV-выгрузку за период.

## 5. RLS smoke checks

После seed заменить UUID в файле:

```text
supabase/tests/rls_smoke_checks.sql
```

и выполнить блоки в SQL Editor.

Ожидаемый результат:

- admin-запросы возвращают операционные строки;
- `foreign_visible_count` для чужих рейсов/смен/документов у водителей равен `0`.
- назначенный через `order_assignments` водитель видит свою заявку и может создать рейс только по своей машине и открытой смене.

## 6. Что считать блокером

- Seed не создает `public.users` - проверьте UUID из `auth.users`.
- Водитель не видит заявку, назначенную через `order_assignments` - проверить миграции `20260531052000...` и `20260613185100...`.
- Водитель не может отправить рейс по назначенной заявке/машине - проверить RLS policy `trips_driver_insert_own_assigned` и открытую смену.
- Водитель видит чужие строки - остановить приемку и исправить RLS.
- ТТН не открывается - проверить `documents.file_path`, bucket `documents` и Storage policies.
- Фото не загружается - проверить MIME type, размер файла и путь `trips/{tripId}/ttn/...`.
