# AVL 84 - Supabase integration runbook

Этот файл нужен для первого подключения живого Supabase-проекта к Flutter-приложению и проверки RLS.

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
```

Затем открыть `supabase/seed/001_dev_seed.sql`, заменить placeholder UUID в `dev_seed_ids` на реальные `auth.users.id` и применить seed.

## 3. Запуск приложения

Из папки `app/`:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

Для web:

```bash
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

## 4. Ручная проверка сценария 0.1

1. Войти админом.
2. Проверить dashboard, заявки, рейсы, смены, документы.
3. Создать или открыть назначенную заявку.
4. Войти водителем.
5. Открыть смену.
6. Создать рейсовый отчет с номером ТТН, объемом и фото.
7. Вернуться админом.
8. Проверить, что рейс появился в журнале.
9. Проверить, что документ появился в разделе `Документы`.
10. Открыть файл ТТН через signed URL.
11. Закрыть смену водителем.
12. Проверить журнал смен и CSV-выгрузку за период.

## 5. RLS smoke checks

После seed заменить UUID в файле:

```text
supabase/tests/rls_smoke_checks.sql
```

и выполнить блоки в SQL Editor.

Ожидаемый результат:

- admin-запросы возвращают операционные строки;
- `foreign_visible_count` для чужих рейсов/смен/документов у водителей равен `0`.

## 6. Что считать блокером

- Seed не создает `public.users` - проверьте UUID из `auth.users`.
- Водитель видит чужие строки - остановить приемку и исправить RLS.
- ТТН не открывается - проверить `documents.file_path`, bucket `documents` и Storage policies.
- Фото не загружается - проверить MIME type, размер файла и путь `trips/{tripId}/ttn/...`.

