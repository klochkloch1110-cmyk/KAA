-- Safe driver-facing orders view.
--
-- Drivers must not receive orders.admin_rate_per_unit. PostgreSQL RLS protects
-- rows, not individual columns, so driver clients should read this view instead
-- of selecting directly from public.orders.

create or replace view public.driver_orders_safe
with (security_invoker = true)
as
select
  o.id,
  o.order_number,
  o.customer_id,
  o.source_org_id,
  o.destination_org_id,
  o.material_id,
  o.pickup_location_id,
  o.dropoff_location_id,
  o.assigned_driver_id,
  o.assigned_vehicle_id,
  o.total_volume_planned,
  o.volume_unit,
  o.driver_rate_per_trip,
  o.status,
  o.order_date,
  c.name as customer_name,
  m.name as material_name,
  pickup.name as pickup_location_name,
  dropoff.name as dropoff_location_name,
  driver.full_name as assigned_driver_name,
  vehicle.plate_number as assigned_vehicle_plate
from public.orders o
join public.customers c on c.id = o.customer_id
join public.materials m on m.id = o.material_id
join public.locations pickup on pickup.id = o.pickup_location_id
join public.locations dropoff on dropoff.id = o.dropoff_location_id
left join public.users driver on driver.id = o.assigned_driver_id
left join public.vehicles vehicle on vehicle.id = o.assigned_vehicle_id
where o.assigned_driver_id = auth.uid();

comment on view public.driver_orders_safe is
  'Driver-facing orders view without admin_rate_per_unit. Uses invoker permissions and base-table RLS.';

grant select on public.driver_orders_safe to authenticated;
