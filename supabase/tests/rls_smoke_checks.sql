-- AVL 84 RLS smoke checks for Supabase SQL Editor.
--
-- Purpose:
--   Verify that admin can see operational data and drivers cannot read
--   other drivers' trips, shifts and documents through direct SQL queries.
--
-- How to use:
--   1. Apply all migrations and seed data.
--   2. Replace the UUID values in `test_ids` with real auth.users.id values.
--   3. Run blocks one by one in SQL Editor.
--
-- Notes:
--   These checks use `set_config('request.jwt.claim.sub', ...)` to simulate
--   authenticated users for RLS in SQL Editor. They are smoke checks, not a
--   replacement for API-level integration tests.

begin;

create temp table test_ids (
  key text primary key,
  id uuid not null
) on commit drop;

insert into test_ids (key, id)
values
  ('admin', '6313198c-9d89-41d3-b565-5faa7f084f13'),
  ('driver_1', '923167f9-e4e3-4c68-aa5a-42caf5f3036d'),
  ('driver_2', '6a9d0702-dd75-4460-9653-4740d3e212e0');

-- -----------------------------------------------------------------------------
-- Admin should see operational data.
-- -----------------------------------------------------------------------------

select set_config('request.jwt.claim.sub', (select id::text from test_ids where key = 'admin'), true);
select set_config('role', 'authenticated', true);

select 'admin_trips_visible' as check_name, count(*) as visible_count from public.trips;
select 'admin_shifts_visible' as check_name, count(*) as visible_count from public.shifts;
select 'admin_documents_visible' as check_name, count(*) as visible_count from public.documents;

-- -----------------------------------------------------------------------------
-- Driver 1 should only see own rows.
-- -----------------------------------------------------------------------------

select set_config('request.jwt.claim.sub', (select id::text from test_ids where key = 'driver_1'), true);
select set_config('role', 'authenticated', true);

select
  'driver_1_foreign_trips_hidden' as check_name,
  count(*) as foreign_visible_count
from public.trips
where driver_id = (select id from test_ids where key = 'driver_2');

select
  'driver_1_foreign_shifts_hidden' as check_name,
  count(*) as foreign_visible_count
from public.shifts
where driver_id = (select id from test_ids where key = 'driver_2');

select
  'driver_1_foreign_documents_hidden' as check_name,
  count(*) as foreign_visible_count
from public.documents d
where d.entity_type = 'trip'
  and exists (
    select 1
    from public.trips t
    where t.id = d.entity_id
      and t.driver_id = (select id from test_ids where key = 'driver_2')
  );

-- -----------------------------------------------------------------------------
-- Driver 2 should only see own rows.
-- -----------------------------------------------------------------------------

select set_config('request.jwt.claim.sub', (select id::text from test_ids where key = 'driver_2'), true);
select set_config('role', 'authenticated', true);

select
  'driver_2_foreign_trips_hidden' as check_name,
  count(*) as foreign_visible_count
from public.trips
where driver_id = (select id from test_ids where key = 'driver_1');

select
  'driver_2_foreign_shifts_hidden' as check_name,
  count(*) as foreign_visible_count
from public.shifts
where driver_id = (select id from test_ids where key = 'driver_1');

select
  'driver_2_foreign_documents_hidden' as check_name,
  count(*) as foreign_visible_count
from public.documents d
where d.entity_type = 'trip'
  and exists (
    select 1
    from public.trips t
    where t.id = d.entity_id
      and t.driver_id = (select id from test_ids where key = 'driver_1')
  );

rollback;
