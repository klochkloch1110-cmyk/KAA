-- AVL 84 core schema
-- First operational contour: users, vehicles, dictionaries, orders, shifts,
-- trips, documents, OCR metadata, notifications and audit logs.

create extension if not exists pgcrypto;

-- Functions below reference tables that are created later in this migration.
-- Supabase SQL Editor validates SQL function bodies at creation time unless this
-- setting is disabled for the migration session.
set check_function_bodies = off;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.app_role as enum ('admin', 'driver', 'operator');
create type public.user_status as enum ('active', 'blocked', 'invited');
create type public.vehicle_status as enum ('active', 'service', 'repair', 'inactive');
create type public.organization_type as enum ('source', 'destination', 'universal');
create type public.volume_unit as enum ('m3', 'ton');
create type public.order_status as enum ('draft', 'assigned', 'in_progress', 'completed', 'cancelled', 'archived');
create type public.trip_status as enum ('submitted', 'verified', 'needs_review', 'rejected');
create type public.ocr_status as enum ('pending', 'matched', 'mismatch', 'failed', 'not_required');
create type public.ocr_comparison_status as enum ('matched', 'mismatch', 'failed');
create type public.shift_status as enum ('open', 'submitted', 'approved', 'needs_review');
create type public.document_entity_type as enum ('trip', 'shift', 'expense', 'chat_message', 'vehicle');
create type public.document_type as enum ('ttn', 'supporting_doc', 'fuel_receipt', 'expense_receipt', 'other_photo');
create type public.notification_entity_type as enum ('order', 'trip', 'shift', 'vehicle', 'document', 'system');
create type public.audit_entity_type as enum ('user', 'vehicle', 'order', 'trip', 'shift', 'document', 'expense', 'payroll', 'system');

-- -----------------------------------------------------------------------------
-- Utility functions
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

create or replace function public.is_operator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'operator'), false)
$$;

set check_function_bodies = on;

-- -----------------------------------------------------------------------------
-- Users and roles
-- -----------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'driver',
  full_name text not null,
  phone text not null,
  avatar_url text,
  status public.user_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create table public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  license_number text,
  employment_date date,
  notes text
);

-- -----------------------------------------------------------------------------
-- Vehicles
-- -----------------------------------------------------------------------------

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text,
  plate_number text not null unique,
  vin text,
  current_odometer integer check (current_odometer is null or current_odometer >= 0),
  status public.vehicle_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Dictionaries
-- -----------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  inn text,
  contact_person text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.organization_type not null default 'universal',
  address text,
  contact_info text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit public.volume_unit not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger materials_set_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders and shifts
-- -----------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  order_date date not null default current_date,
  customer_id uuid not null references public.customers(id),
  source_org_id uuid not null references public.organizations(id),
  destination_org_id uuid not null references public.organizations(id),
  material_id uuid not null references public.materials(id),
  total_volume_planned numeric(12,2) check (total_volume_planned is null or total_volume_planned >= 0),
  volume_unit public.volume_unit not null,
  pickup_location_id uuid not null references public.locations(id),
  dropoff_location_id uuid not null references public.locations(id),
  route_snapshot_json jsonb,
  driver_rate_per_trip numeric(12,2) not null check (driver_rate_per_trip >= 0),
  admin_rate_per_unit numeric(12,2) check (admin_rate_per_unit is null or admin_rate_per_unit >= 0),
  notes text,
  status public.order_status not null default 'draft',
  created_by uuid not null references public.users(id),
  assigned_driver_id uuid references public.users(id),
  assigned_vehicle_id uuid references public.vehicles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_assigned_requires_driver_and_vehicle check (
    status not in ('assigned', 'in_progress')
    or (assigned_driver_id is not null and assigned_vehicle_id is not null)
  )
);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null default current_date,
  driver_id uuid not null references public.users(id),
  vehicle_id uuid not null references public.vehicles(id),
  status public.shift_status not null default 'open',
  start_time timestamptz,
  end_time timestamptz,
  closing_odometer integer check (closing_odometer is null or closing_odometer >= 0),
  fuel_filled_liters numeric(10,2) check (fuel_filled_liters is null or fuel_filled_liters >= 0),
  notes text,
  total_trips_cached integer not null default 0 check (total_trips_cached >= 0),
  total_volume_cached numeric(12,2) not null default 0 check (total_volume_cached >= 0),
  total_earnings_cached numeric(12,2) not null default 0 check (total_earnings_cached >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index shifts_one_open_per_driver_idx
on public.shifts(driver_id)
where status = 'open';

create trigger shifts_set_updated_at
before update on public.shifts
for each row execute function public.set_updated_at();

create table public.vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id),
  driver_id uuid not null references public.users(id),
  shift_id uuid references public.shifts(id),
  assigned_from timestamptz not null default now(),
  assigned_to timestamptz,
  created_at timestamptz not null default now(),
  constraint vehicle_assignments_valid_period check (assigned_to is null or assigned_to >= assigned_from)
);

-- -----------------------------------------------------------------------------
-- Trips, documents, OCR
-- -----------------------------------------------------------------------------

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  shift_id uuid not null references public.shifts(id),
  driver_id uuid not null references public.users(id),
  vehicle_id uuid not null references public.vehicles(id),
  trip_number_in_shift integer check (trip_number_in_shift is null or trip_number_in_shift > 0),
  trip_date timestamptz not null default now(),
  loaded_volume numeric(12,2) not null check (loaded_volume >= 0),
  volume_unit public.volume_unit not null,
  ttn_number_manual text not null,
  status public.trip_status not null default 'submitted',
  ocr_status public.ocr_status not null default 'not_required',
  ocr_ttn_number text,
  ocr_volume numeric(12,2) check (ocr_volume is null or ocr_volume >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  entity_type public.document_entity_type not null,
  entity_id uuid not null,
  document_type public.document_type not null,
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  uploaded_by uuid not null references public.users(id),
  uploaded_at timestamptz not null default now(),
  metadata_json jsonb
);

create table public.ocr_results (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  provider text not null,
  raw_text text,
  parsed_ttn_number text,
  parsed_volume numeric(12,2) check (parsed_volume is null or parsed_volume >= 0),
  confidence numeric(5,2) check (confidence is null or (confidence >= 0 and confidence <= 100)),
  comparison_status public.ocr_comparison_status not null,
  compared_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Notifications and audit
-- -----------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  linked_entity_type public.notification_entity_type,
  linked_entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  entity_type public.audit_entity_type not null,
  entity_id uuid not null,
  old_data_json jsonb,
  new_data_json jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index users_role_idx on public.users(role);
create index users_status_idx on public.users(status);

create index vehicles_status_idx on public.vehicles(status);

create index orders_order_date_idx on public.orders(order_date);
create index orders_status_idx on public.orders(status);
create index orders_assigned_driver_id_idx on public.orders(assigned_driver_id);
create index orders_assigned_vehicle_id_idx on public.orders(assigned_vehicle_id);

create index shifts_driver_date_idx on public.shifts(driver_id, shift_date);
create index shifts_vehicle_date_idx on public.shifts(vehicle_id, shift_date);
create index shifts_status_idx on public.shifts(status);

create index trips_order_id_idx on public.trips(order_id);
create index trips_shift_id_idx on public.trips(shift_id);
create index trips_driver_id_idx on public.trips(driver_id);
create index trips_vehicle_id_idx on public.trips(vehicle_id);
create index trips_trip_date_idx on public.trips(trip_date);
create index trips_status_idx on public.trips(status);
create index trips_ocr_status_idx on public.trips(ocr_status);

create index documents_entity_idx on public.documents(entity_type, entity_id);
create index documents_uploaded_by_idx on public.documents(uploaded_by);
create index documents_document_type_idx on public.documents(document_type);

create index ocr_results_trip_id_idx on public.ocr_results(trip_id);
create index ocr_results_document_id_idx on public.ocr_results(document_id);
create index ocr_results_comparison_status_idx on public.ocr_results(comparison_status);

create index notifications_user_read_idx on public.notifications(user_id, is_read);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_user_idx on public.audit_logs(user_id);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.customers enable row level security;
alter table public.organizations enable row level security;
alter table public.materials enable row level security;
alter table public.locations enable row level security;
alter table public.orders enable row level security;
alter table public.shifts enable row level security;
alter table public.vehicle_assignments enable row level security;
alter table public.trips enable row level security;
alter table public.documents enable row level security;
alter table public.ocr_results enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Users
create policy users_select_own_or_staff
on public.users for select
to authenticated
using (id = auth.uid() or public.is_operator_or_admin());

create policy users_admin_insert
on public.users for insert
to authenticated
with check (public.is_admin());

create policy users_admin_update
on public.users for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy users_admin_delete
on public.users for delete
to authenticated
using (public.is_admin());

create policy users_update_own_limited
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Driver profiles
create policy driver_profiles_select_own_or_staff
on public.driver_profiles for select
to authenticated
using (user_id = auth.uid() or public.is_operator_or_admin());

create policy driver_profiles_admin_insert
on public.driver_profiles for insert
to authenticated
with check (public.is_admin());

create policy driver_profiles_admin_update
on public.driver_profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy driver_profiles_admin_delete
on public.driver_profiles for delete
to authenticated
using (public.is_admin());

-- Dictionaries: staff can mutate, authenticated can read active reference data.
create policy customers_select_authenticated
on public.customers for select
to authenticated
using (true);

create policy customers_staff_insert
on public.customers for insert
to authenticated
with check (public.is_operator_or_admin());

create policy customers_staff_update
on public.customers for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy customers_staff_delete
on public.customers for delete
to authenticated
using (public.is_admin());

create policy organizations_select_authenticated
on public.organizations for select
to authenticated
using (true);

create policy organizations_staff_insert
on public.organizations for insert
to authenticated
with check (public.is_operator_or_admin());

create policy organizations_staff_update
on public.organizations for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy organizations_staff_delete
on public.organizations for delete
to authenticated
using (public.is_admin());

create policy materials_select_authenticated
on public.materials for select
to authenticated
using (true);

create policy materials_staff_insert
on public.materials for insert
to authenticated
with check (public.is_operator_or_admin());

create policy materials_staff_update
on public.materials for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy materials_staff_delete
on public.materials for delete
to authenticated
using (public.is_admin());

create policy locations_select_authenticated
on public.locations for select
to authenticated
using (true);

create policy locations_staff_insert
on public.locations for insert
to authenticated
with check (public.is_operator_or_admin());

create policy locations_staff_update
on public.locations for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy locations_staff_delete
on public.locations for delete
to authenticated
using (public.is_admin());

-- Vehicles
create policy vehicles_select_staff_or_assigned_driver
on public.vehicles for select
to authenticated
using (
  public.is_operator_or_admin()
  or exists (
    select 1 from public.orders o
    where o.assigned_vehicle_id = vehicles.id
      and o.assigned_driver_id = auth.uid()
      and o.status in ('assigned', 'in_progress')
  )
  or exists (
    select 1 from public.shifts s
    where s.vehicle_id = vehicles.id
      and s.driver_id = auth.uid()
      and s.status in ('open', 'submitted', 'needs_review')
  )
);

create policy vehicles_staff_insert
on public.vehicles for insert
to authenticated
with check (public.is_operator_or_admin());

create policy vehicles_staff_update
on public.vehicles for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy vehicles_staff_delete
on public.vehicles for delete
to authenticated
using (public.is_admin());

-- Orders
create policy orders_select_staff_or_assigned_driver
on public.orders for select
to authenticated
using (public.is_operator_or_admin() or assigned_driver_id = auth.uid());

create policy orders_staff_insert
on public.orders for insert
to authenticated
with check (public.is_operator_or_admin());

create policy orders_staff_update
on public.orders for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy orders_staff_delete
on public.orders for delete
to authenticated
using (public.is_admin());

-- Shifts
create policy shifts_select_staff_or_owner
on public.shifts for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

create policy shifts_driver_insert_own
on public.shifts for insert
to authenticated
with check (driver_id = auth.uid());

create policy shifts_driver_update_own_open
on public.shifts for update
to authenticated
using (driver_id = auth.uid() and status in ('open', 'needs_review'))
with check (driver_id = auth.uid());

create policy shifts_staff_insert
on public.shifts for insert
to authenticated
with check (public.is_operator_or_admin());

create policy shifts_staff_update
on public.shifts for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy shifts_staff_delete
on public.shifts for delete
to authenticated
using (public.is_admin());

-- Vehicle assignments
create policy vehicle_assignments_select_staff_or_owner
on public.vehicle_assignments for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

create policy vehicle_assignments_staff_insert
on public.vehicle_assignments for insert
to authenticated
with check (public.is_operator_or_admin());

create policy vehicle_assignments_staff_update
on public.vehicle_assignments for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy vehicle_assignments_staff_delete
on public.vehicle_assignments for delete
to authenticated
using (public.is_admin());

-- Trips
create policy trips_select_staff_or_owner
on public.trips for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

create policy trips_driver_insert_own_assigned
on public.trips for insert
to authenticated
with check (
  driver_id = auth.uid()
  and exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.assigned_driver_id = auth.uid()
      and o.assigned_vehicle_id = vehicle_id
      and o.status in ('assigned', 'in_progress')
  )
  and exists (
    select 1 from public.shifts s
    where s.id = shift_id
      and s.driver_id = auth.uid()
      and s.vehicle_id = vehicle_id
      and s.status = 'open'
  )
);

create policy trips_driver_update_own_unverified
on public.trips for update
to authenticated
using (driver_id = auth.uid() and status in ('submitted', 'rejected'))
with check (driver_id = auth.uid());

create policy trips_staff_insert
on public.trips for insert
to authenticated
with check (public.is_operator_or_admin());

create policy trips_staff_update
on public.trips for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy trips_staff_delete
on public.trips for delete
to authenticated
using (public.is_admin());

-- Documents
create policy documents_select_staff_or_related_owner
on public.documents for select
to authenticated
using (
  public.is_operator_or_admin()
  or uploaded_by = auth.uid()
  or (
    entity_type = 'trip'
    and exists (
      select 1 from public.trips t
      where t.id = documents.entity_id and t.driver_id = auth.uid()
    )
  )
  or (
    entity_type = 'shift'
    and exists (
      select 1 from public.shifts s
      where s.id = documents.entity_id and s.driver_id = auth.uid()
    )
  )
);

create policy documents_insert_own_related
on public.documents for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and (
    public.is_operator_or_admin()
    or (
      entity_type = 'trip'
      and exists (
        select 1 from public.trips t
        where t.id = entity_id and t.driver_id = auth.uid()
      )
    )
    or (
      entity_type = 'shift'
      and exists (
        select 1 from public.shifts s
        where s.id = entity_id and s.driver_id = auth.uid()
      )
    )
  )
);

create policy documents_staff_insert
on public.documents for insert
to authenticated
with check (public.is_operator_or_admin());

create policy documents_staff_update
on public.documents for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy documents_staff_delete
on public.documents for delete
to authenticated
using (public.is_admin());

-- OCR results
create policy ocr_results_select_staff_or_trip_owner
on public.ocr_results for select
to authenticated
using (
  public.is_operator_or_admin()
  or exists (
    select 1 from public.trips t
    where t.id = ocr_results.trip_id and t.driver_id = auth.uid()
  )
);

create policy ocr_results_staff_insert
on public.ocr_results for insert
to authenticated
with check (public.is_operator_or_admin());

create policy ocr_results_staff_update
on public.ocr_results for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy ocr_results_staff_delete
on public.ocr_results for delete
to authenticated
using (public.is_admin());

-- Notifications
create policy notifications_select_own_or_staff
on public.notifications for select
to authenticated
using (user_id = auth.uid() or public.is_operator_or_admin());

create policy notifications_update_own_read
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy notifications_staff_insert
on public.notifications for insert
to authenticated
with check (public.is_operator_or_admin());

create policy notifications_staff_update
on public.notifications for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy notifications_staff_delete
on public.notifications for delete
to authenticated
using (public.is_admin());

-- Audit logs
create policy audit_logs_staff_select
on public.audit_logs for select
to authenticated
using (public.is_operator_or_admin());

create policy audit_logs_staff_insert
on public.audit_logs for insert
to authenticated
with check (public.is_operator_or_admin() or user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Storage bucket metadata
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Storage policies are intentionally conservative. Object paths must start with
-- the authenticated user id for direct client uploads in the first release.
-- Later, Edge Functions can move files to canonical entity-based paths.
create policy storage_documents_select_own_prefix_or_staff
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and (
    public.is_operator_or_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

create policy storage_documents_insert_own_prefix
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy storage_documents_update_staff
on storage.objects for update
to authenticated
using (bucket_id = 'documents' and public.is_operator_or_admin())
with check (bucket_id = 'documents' and public.is_operator_or_admin());

create policy storage_documents_delete_staff
on storage.objects for delete
to authenticated
using (bucket_id = 'documents' and public.is_operator_or_admin());
