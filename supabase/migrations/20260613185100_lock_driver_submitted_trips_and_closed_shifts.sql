-- Drivers can create trip reports and close their currently open shift.
-- After submission/closure, corrections for release 0.1 are handled by staff.
-- This migration also completes RLS support for multi-driver assignments:
-- driver access must work through public.order_assignments, not only through
-- the legacy orders.assigned_driver_id / orders.assigned_vehicle_id columns.

drop policy if exists vehicles_select_staff_or_assigned_driver on public.vehicles;
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
    select 1 from public.order_assignments oa
    join public.orders o on o.id = oa.order_id
    where oa.vehicle_id = vehicles.id
      and oa.driver_id = auth.uid()
      and o.status in ('assigned', 'in_progress')
  )
  or exists (
    select 1 from public.shifts s
    where s.vehicle_id = vehicles.id
      and s.driver_id = auth.uid()
      and s.status in ('open', 'submitted', 'needs_review')
  )
);

drop policy if exists trips_driver_insert_own_assigned on public.trips;
create policy trips_driver_insert_own_assigned
on public.trips for insert
to authenticated
with check (
  driver_id = auth.uid()
  and exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.status in ('assigned', 'in_progress')
      and (
        (o.assigned_driver_id = auth.uid() and o.assigned_vehicle_id = vehicle_id)
        or exists (
          select 1 from public.order_assignments oa
          where oa.order_id = o.id
            and oa.driver_id = auth.uid()
            and oa.vehicle_id = vehicle_id
        )
      )
  )
  and exists (
    select 1 from public.shifts s
    where s.id = shift_id
      and s.driver_id = auth.uid()
      and s.vehicle_id = vehicle_id
      and s.status = 'open'
  )
);

drop policy if exists trips_driver_update_own_unverified on public.trips;

drop policy if exists shifts_driver_update_own_open on public.shifts;
create policy shifts_driver_update_own_open
on public.shifts for update
to authenticated
using (driver_id = auth.uid() and status = 'open')
with check (driver_id = auth.uid() and status = 'submitted');
