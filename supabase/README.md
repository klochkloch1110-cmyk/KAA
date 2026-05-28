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

## Первый технический контур

Миграция ядра создает:

- пользователей приложения;
- профили водителей;
- машины;
- справочники;
- заявки;
- смены;
- рейсы;
- документы;
- OCR-результаты;
- уведомления;
- audit log;
- базовые RLS-политики.

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
```

После миграций применить:

```text
supabase/seed/001_dev_seed.sql
```

### 3. Запустить Flutter с реальным backend

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

Для web можно добавить `-d chrome`, для Android - выбрать подключенное устройство.

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
