-- AVL 84 extended schema for expenses, fuel, maintenance, payroll, reports and chat.
-- These tables are not required for the first operational contour, but are
-- created early to avoid future data-model rewrites.

create type public.expense_payment_status as enum ('pending', 'paid');
create type public.expense_source as enum ('admin', 'driver');
create type public.maintenance_service_type as enum ('maintenance', 'repair', 'tires', 'consumables', 'other');
create type public.payroll_payment_status as enum ('accrued', 'approved', 'paid');
create type public.report_type as enum ('customer', 'internal_trips', 'payroll', 'expenses', 'vehicle_summary');
create type public.chat_room_type as enum ('general', 'order', 'system');
create type public.chat_linked_entity_type as enum ('order', 'trip', 'shift', 'vehicle');

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger expense_categories_set_updated_at
before update on public.expense_categories
for each row execute function public.set_updated_at();

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category_id uuid not null references public.expense_categories(id),
  vehicle_id uuid references public.vehicles(id),
  driver_id uuid references public.users(id),
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  payment_status public.expense_payment_status not null default 'pending',
  source public.expense_source not null default 'admin',
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

create table public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id),
  driver_id uuid references public.users(id),
  shift_id uuid references public.shifts(id),
  liters numeric(10,2) not null check (liters >= 0),
  amount numeric(12,2) check (amount is null or amount >= 0),
  odometer integer check (odometer is null or odometer >= 0),
  fuel_date timestamptz not null default now(),
  document_id uuid references public.documents(id),
  created_at timestamptz not null default now()
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id),
  service_type public.maintenance_service_type not null,
  service_date date not null default current_date,
  odometer integer not null check (odometer >= 0),
  amount numeric(12,2) check (amount is null or amount >= 0),
  description text,
  next_service_date date,
  next_service_odometer integer check (next_service_odometer is null or next_service_odometer >= 0),
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger maintenance_records_set_updated_at
before update on public.maintenance_records
for each row execute function public.set_updated_at();

create table public.payroll_entries (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id),
  shift_id uuid references public.shifts(id),
  trip_id uuid references public.trips(id),
  period_start date not null,
  period_end date not null,
  rate_per_trip numeric(12,2) not null check (rate_per_trip >= 0),
  trips_count integer not null check (trips_count >= 0),
  amount_accrued numeric(12,2) not null check (amount_accrued >= 0),
  adjustment_amount numeric(12,2) not null default 0,
  final_amount numeric(12,2) not null,
  payment_status public.payroll_payment_status not null default 'accrued',
  created_at timestamptz not null default now(),
  constraint payroll_period_valid check (period_end >= period_start)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  report_type public.report_type not null,
  period_start date not null,
  period_end date not null,
  filters_json jsonb,
  file_path text,
  generated_by uuid not null references public.users(id),
  generated_at timestamptz not null default now(),
  constraint reports_period_valid check (period_end >= period_start)
);

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  room_type public.chat_room_type not null default 'general',
  title text not null,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  reply_to_message_id uuid references public.chat_messages(id),
  message_text text not null,
  linked_entity_type public.chat_linked_entity_type,
  linked_entity_id uuid,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index expense_categories_active_idx on public.expense_categories(is_active);
create index expenses_vehicle_date_idx on public.expenses(vehicle_id, expense_date);
create index expenses_driver_date_idx on public.expenses(driver_id, expense_date);
create index expenses_payment_status_idx on public.expenses(payment_status);
create index fuel_logs_vehicle_date_idx on public.fuel_logs(vehicle_id, fuel_date);
create index fuel_logs_shift_id_idx on public.fuel_logs(shift_id);
create index maintenance_records_vehicle_date_idx on public.maintenance_records(vehicle_id, service_date);
create index payroll_entries_driver_period_idx on public.payroll_entries(driver_id, period_start, period_end);
create index payroll_entries_payment_status_idx on public.payroll_entries(payment_status);
create index reports_type_period_idx on public.reports(report_type, period_start, period_end);
create index chat_messages_room_created_idx on public.chat_messages(room_id, created_at);
create index chat_messages_sender_idx on public.chat_messages(sender_id);

alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.payroll_entries enable row level security;
alter table public.reports enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

create policy expense_categories_select_authenticated
on public.expense_categories for select
to authenticated
using (true);

create policy expense_categories_staff_insert
on public.expense_categories for insert
to authenticated
with check (public.is_operator_or_admin());

create policy expense_categories_staff_update
on public.expense_categories for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy expense_categories_staff_delete
on public.expense_categories for delete
to authenticated
using (public.is_admin());

create policy expenses_select_staff_or_owner
on public.expenses for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid() or created_by = auth.uid());

create policy expenses_driver_insert_own
on public.expenses for insert
to authenticated
with check (created_by = auth.uid() and (driver_id is null or driver_id = auth.uid()));

create policy expenses_staff_insert
on public.expenses for insert
to authenticated
with check (public.is_operator_or_admin());

create policy expenses_staff_update
on public.expenses for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy expenses_staff_delete
on public.expenses for delete
to authenticated
using (public.is_admin());

create policy fuel_logs_select_staff_or_owner
on public.fuel_logs for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

create policy fuel_logs_driver_insert_own_shift
on public.fuel_logs for insert
to authenticated
with check (
  driver_id = auth.uid()
  and (
    shift_id is null
    or exists (
      select 1 from public.shifts s
      where s.id = shift_id and s.driver_id = auth.uid()
    )
  )
);

create policy fuel_logs_staff_insert
on public.fuel_logs for insert
to authenticated
with check (public.is_operator_or_admin());

create policy fuel_logs_staff_update
on public.fuel_logs for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy fuel_logs_staff_delete
on public.fuel_logs for delete
to authenticated
using (public.is_admin());

create policy maintenance_records_staff_select
on public.maintenance_records for select
to authenticated
using (public.is_operator_or_admin());

create policy maintenance_records_staff_insert
on public.maintenance_records for insert
to authenticated
with check (public.is_operator_or_admin());

create policy maintenance_records_staff_update
on public.maintenance_records for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy maintenance_records_staff_delete
on public.maintenance_records for delete
to authenticated
using (public.is_admin());

create policy payroll_entries_select_staff_or_owner
on public.payroll_entries for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

create policy payroll_entries_staff_insert
on public.payroll_entries for insert
to authenticated
with check (public.is_operator_or_admin());

create policy payroll_entries_staff_update
on public.payroll_entries for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy payroll_entries_staff_delete
on public.payroll_entries for delete
to authenticated
using (public.is_admin());

create policy reports_staff_select
on public.reports for select
to authenticated
using (public.is_operator_or_admin());

create policy reports_staff_insert
on public.reports for insert
to authenticated
with check (public.is_operator_or_admin());

create policy reports_staff_update
on public.reports for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy reports_staff_delete
on public.reports for delete
to authenticated
using (public.is_admin());

create policy chat_rooms_select_authenticated
on public.chat_rooms for select
to authenticated
using (true);

create policy chat_rooms_staff_insert
on public.chat_rooms for insert
to authenticated
with check (public.is_operator_or_admin());

create policy chat_rooms_staff_update
on public.chat_rooms for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

create policy chat_rooms_staff_delete
on public.chat_rooms for delete
to authenticated
using (public.is_admin());

create policy chat_messages_select_authenticated_not_deleted
on public.chat_messages for select
to authenticated
using (deleted_at is null or public.is_operator_or_admin());

create policy chat_messages_insert_authenticated
on public.chat_messages for insert
to authenticated
with check (sender_id = auth.uid());

create policy chat_messages_update_own_or_staff
on public.chat_messages for update
to authenticated
using (sender_id = auth.uid() or public.is_operator_or_admin())
with check (sender_id = auth.uid() or public.is_operator_or_admin());
