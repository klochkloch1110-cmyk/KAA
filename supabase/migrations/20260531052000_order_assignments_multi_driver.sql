-- Multiple drivers per order.

create table if not exists public.order_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  driver_id uuid not null references public.users(id),
  vehicle_id uuid not null references public.vehicles(id),
  assigned_at timestamptz not null default now(),
  created_by uuid references public.users(id),
  unique (order_id, driver_id)
);

alter table public.order_assignments enable row level security;

drop policy if exists order_assignments_select_staff_or_driver on public.order_assignments;
create policy order_assignments_select_staff_or_driver
on public.order_assignments for select
to authenticated
using (public.is_operator_or_admin() or driver_id = auth.uid());

drop policy if exists order_assignments_staff_insert on public.order_assignments;
create policy order_assignments_staff_insert
on public.order_assignments for insert
to authenticated
with check (public.is_operator_or_admin());

drop policy if exists order_assignments_staff_update on public.order_assignments;
create policy order_assignments_staff_update
on public.order_assignments for update
to authenticated
using (public.is_operator_or_admin())
with check (public.is_operator_or_admin());

drop policy if exists order_assignments_staff_delete on public.order_assignments;
create policy order_assignments_staff_delete
on public.order_assignments for delete
to authenticated
using (public.is_operator_or_admin());

drop policy if exists orders_select_staff_or_assigned_driver on public.orders;
create policy orders_select_staff_or_assigned_driver
on public.orders for select
to authenticated
using (
  public.is_operator_or_admin()
  or assigned_driver_id = auth.uid()
  or exists (
    select 1 from public.order_assignments oa
    where oa.order_id = orders.id and oa.driver_id = auth.uid()
  )
);

insert into public.order_assignments (order_id, driver_id, vehicle_id, created_by)
select id, assigned_driver_id, assigned_vehicle_id, created_by
from public.orders
where assigned_driver_id is not null
  and assigned_vehicle_id is not null
on conflict (order_id, driver_id) do update set
  vehicle_id = excluded.vehicle_id;
