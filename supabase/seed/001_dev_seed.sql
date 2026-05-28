-- AVL 84 development seed.
--
-- Безопасный порядок запуска для dev:
-- 1. Создайте пользователей в Supabase Auth.
-- 2. Замените UUID ниже на реальные auth.users.id.
-- 3. Запустите seed повторно. Все вставки идемпотентны.
--
-- Не храните здесь реальные пароли, токены и персональные данные production.

-- ----------------------------------------------------------------------------
-- Dev auth user ids - replace before applying to a real Supabase project.
-- ----------------------------------------------------------------------------

-- Администратор / руководитель.
-- Пример email в Auth: admin@avl84.local
-- \set admin_user_id '00000000-0000-0000-0000-000000000001'

-- Водители.
-- Пример email в Auth: driver1@avl84.local, driver2@avl84.local
-- \set driver_1_user_id '00000000-0000-0000-0000-000000000002'
-- \set driver_2_user_id '00000000-0000-0000-0000-000000000003'

-- Для запуска без psql variables используем временную таблицу с понятными UUID.
-- В Supabase Cloud эти UUID должны существовать в auth.users, иначе вставка users
-- будет пропущена через where exists.
create temp table if not exists dev_seed_ids (
  key text primary key,
  id uuid not null
) on commit drop;

insert into dev_seed_ids (key, id)
values
  ('admin', '6313198c-9d89-41d3-b565-5faa7f084f13'),
  ('driver_1', '923167f9-e4e3-4c68-aa5a-42caf5f3036d'),
  ('driver_2', '6a9d0702-dd75-4460-9653-4740d3e212e0')
on conflict (key) do update set id = excluded.id;

-- ----------------------------------------------------------------------------
-- Users and driver profiles
-- ----------------------------------------------------------------------------

insert into public.users (id, role, full_name, phone, status)
select seed.id, seed.role::public.app_role, seed.full_name, seed.phone, 'active'::public.user_status
from (
  values
    ((select id from dev_seed_ids where key = 'admin'), 'admin', 'Администратор AVL 84', '+7 900 000-00-01'),
    ((select id from dev_seed_ids where key = 'driver_1'), 'driver', 'Иванов Иван Петрович', '+7 999 111-22-33'),
    ((select id from dev_seed_ids where key = 'driver_2'), 'driver', 'Петров Сергей Николаевич', '+7 999 222-33-44')
) as seed(id, role, full_name, phone)
where exists (select 1 from auth.users au where au.id = seed.id)
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  phone = excluded.phone,
  status = excluded.status;

insert into public.driver_profiles (user_id, license_number, employment_date, notes)
select u.id, seed.license_number, current_date - interval '180 days', 'Dev-профиль водителя'
from public.users u
join (
  values
    ((select id from dev_seed_ids where key = 'driver_1'), '77 11 123456'),
    ((select id from dev_seed_ids where key = 'driver_2'), '77 22 654321')
) as seed(user_id, license_number) on seed.user_id = u.id
where u.role = 'driver'
on conflict (user_id) do update set
  license_number = excluded.license_number,
  employment_date = excluded.employment_date,
  notes = excluded.notes;

-- ----------------------------------------------------------------------------
-- Dictionaries
-- ----------------------------------------------------------------------------

insert into public.customers (name, inn, contact_person, phone, notes)
select seed.name, seed.inn, seed.contact_person, seed.phone, 'Dev-заказчик'
from (
  values
    ('Стройком-М', '7701000001', 'Марина Орлова', '+7 495 100-10-01'),
    ('БетонИнвест', '7701000002', 'Олег Соколов', '+7 495 100-10-02'),
    ('МосДорСнаб', '7701000003', 'Ирина Кузнецова', '+7 495 100-10-03')
) as seed(name, inn, contact_person, phone)
where not exists (select 1 from public.customers c where c.name = seed.name);

insert into public.organizations (name, type, address, contact_info, notes)
select seed.name, seed.type::public.organization_type, seed.address, seed.contact_info, seed.notes
from (
  values
    ('Карьер №3', 'source', 'Московская область, карьер №3', '+7 495 200-20-01', 'Точка отгрузки'),
    ('База Мытищи', 'source', 'Мытищи, Промышленная зона', '+7 495 200-20-02', 'Точка отгрузки'),
    ('Объекты Москвы и области', 'destination', 'Москва и Московская область', '+7 495 200-20-03', 'Получатель/объекты')
) as seed(name, type, address, contact_info, notes)
where not exists (select 1 from public.organizations o where o.name = seed.name);

insert into public.materials (name, unit, is_active)
select seed.name, seed.unit::public.volume_unit, true
from (
  values
    ('Песок', 'ton'),
    ('Щебень', 'ton'),
    ('Грунт', 'm3')
) as seed(name, unit)
where not exists (select 1 from public.materials m where m.name = seed.name);

insert into public.locations (name, address, latitude, longitude, comment)
select seed.name, seed.address, seed.latitude, seed.longitude, seed.comment
from (
  values
    ('Карьер №3', 'Московская область, карьер №3', 55.9730000, 37.2180000, 'Погрузка песка'),
    ('База Мытищи', 'Мытищи, Промышленная зона', 55.9160000, 37.7610000, 'Погрузка щебня'),
    ('Ленина, 45', 'Москва, ул. Ленина, 45', 55.7558000, 37.6176000, 'Объект клиента'),
    ('Химки, Заводская 12', 'Химки, Заводская 12', 55.8970000, 37.4290000, 'Объект клиента'),
    ('Долгопрудный, участок 8', 'Долгопрудный, участок 8', 55.9380000, 37.5150000, 'Объект клиента')
) as seed(name, address, latitude, longitude, comment)
where not exists (select 1 from public.locations l where l.name = seed.name and l.address = seed.address);

insert into public.expense_categories (name)
select seed.name
from (values ('Топливо'), ('Ремонт'), ('Шиномонтаж'), ('Расходники'), ('Прочее')) as seed(name)
where not exists (select 1 from public.expense_categories ec where ec.name = seed.name);

-- ----------------------------------------------------------------------------
-- Vehicles
-- ----------------------------------------------------------------------------

insert into public.vehicles (brand, model, plate_number, current_odometer, status, notes)
values
  ('КамАЗ', '6520', 'А123КС 77', 184230, 'active', 'Dev-машина'),
  ('Shacman', 'X3000', 'М482ОР 790', 126480, 'active', 'Dev-машина'),
  ('Howo', 'T5G', 'Е901ТР 50', 208910, 'service', 'На сервисе')
on conflict (plate_number) do update set
  brand = excluded.brand,
  model = excluded.model,
  current_odometer = excluded.current_odometer,
  status = excluded.status,
  notes = excluded.notes;

insert into public.vehicle_assignments (vehicle_id, driver_id, assigned_from)
select v.id, u.id, now() - interval '30 days'
from (
  values
    ('А123КС 77', (select id from dev_seed_ids where key = 'driver_1')),
    ('М482ОР 790', (select id from dev_seed_ids where key = 'driver_2'))
) as seed(plate_number, driver_id)
join public.vehicles v on v.plate_number = seed.plate_number
join public.users u on u.id = seed.driver_id
where not exists (
  select 1 from public.vehicle_assignments va
  where va.vehicle_id = v.id and va.driver_id = u.id and va.assigned_to is null
);

-- ----------------------------------------------------------------------------
-- Orders. Created only if admin and drivers exist in public.users.
-- ----------------------------------------------------------------------------

insert into public.orders (
  order_number,
  customer_id,
  source_org_id,
  destination_org_id,
  material_id,
  total_volume_planned,
  volume_unit,
  pickup_location_id,
  dropoff_location_id,
  driver_rate_per_trip,
  admin_rate_per_unit,
  status,
  created_by,
  assigned_driver_id,
  assigned_vehicle_id,
  notes
)
select
  'AVL-0021/05/26',
  c.id,
  source_org.id,
  dest_org.id,
  m.id,
  240,
  'ton',
  pickup.id,
  dropoff.id,
  1500,
  620,
  'in_progress',
  admin_user.id,
  driver_user.id,
  vehicle.id,
  'Dev-заявка: песок'
from public.customers c
join public.organizations source_org on source_org.name = 'Карьер №3'
join public.organizations dest_org on dest_org.name = 'Объекты Москвы и области'
join public.materials m on m.name = 'Песок'
join public.locations pickup on pickup.name = 'Карьер №3'
join public.locations dropoff on dropoff.name = 'Ленина, 45'
join public.users admin_user on admin_user.id = (select id from dev_seed_ids where key = 'admin')
join public.users driver_user on driver_user.id = (select id from dev_seed_ids where key = 'driver_1')
join public.vehicles vehicle on vehicle.plate_number = 'А123КС 77'
where c.name = 'Стройком-М'
on conflict (order_number) do update set
  customer_id = excluded.customer_id,
  source_org_id = excluded.source_org_id,
  destination_org_id = excluded.destination_org_id,
  material_id = excluded.material_id,
  total_volume_planned = excluded.total_volume_planned,
  volume_unit = excluded.volume_unit,
  pickup_location_id = excluded.pickup_location_id,
  dropoff_location_id = excluded.dropoff_location_id,
  driver_rate_per_trip = excluded.driver_rate_per_trip,
  admin_rate_per_unit = excluded.admin_rate_per_unit,
  status = excluded.status,
  assigned_driver_id = excluded.assigned_driver_id,
  assigned_vehicle_id = excluded.assigned_vehicle_id,
  notes = excluded.notes;

insert into public.orders (
  order_number,
  customer_id,
  source_org_id,
  destination_org_id,
  material_id,
  total_volume_planned,
  volume_unit,
  pickup_location_id,
  dropoff_location_id,
  driver_rate_per_trip,
  admin_rate_per_unit,
  status,
  created_by,
  assigned_driver_id,
  assigned_vehicle_id,
  notes
)
select
  'AVL-0022/05/26',
  c.id,
  source_org.id,
  dest_org.id,
  m.id,
  180,
  'ton',
  pickup.id,
  dropoff.id,
  1600,
  680,
  'assigned',
  admin_user.id,
  driver_user.id,
  vehicle.id,
  'Dev-заявка: щебень'
from public.customers c
join public.organizations source_org on source_org.name = 'База Мытищи'
join public.organizations dest_org on dest_org.name = 'Объекты Москвы и области'
join public.materials m on m.name = 'Щебень'
join public.locations pickup on pickup.name = 'База Мытищи'
join public.locations dropoff on dropoff.name = 'Химки, Заводская 12'
join public.users admin_user on admin_user.id = (select id from dev_seed_ids where key = 'admin')
join public.users driver_user on driver_user.id = (select id from dev_seed_ids where key = 'driver_2')
join public.vehicles vehicle on vehicle.plate_number = 'М482ОР 790'
where c.name = 'БетонИнвест'
on conflict (order_number) do update set
  customer_id = excluded.customer_id,
  source_org_id = excluded.source_org_id,
  destination_org_id = excluded.destination_org_id,
  material_id = excluded.material_id,
  total_volume_planned = excluded.total_volume_planned,
  volume_unit = excluded.volume_unit,
  pickup_location_id = excluded.pickup_location_id,
  dropoff_location_id = excluded.dropoff_location_id,
  driver_rate_per_trip = excluded.driver_rate_per_trip,
  admin_rate_per_unit = excluded.admin_rate_per_unit,
  status = excluded.status,
  assigned_driver_id = excluded.assigned_driver_id,
  assigned_vehicle_id = excluded.assigned_vehicle_id,
  notes = excluded.notes;

insert into public.chat_rooms (room_type, title)
select 'general', 'Общий рабочий чат'
where not exists (
  select 1 from public.chat_rooms cr
  where cr.room_type = 'general' and cr.title = 'Общий рабочий чат'
);
