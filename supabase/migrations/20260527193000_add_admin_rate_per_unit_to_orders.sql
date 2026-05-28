-- Add admin-only unit rate to orders.
-- It is used for management economics by transported unit (ton/m3) and is not
-- exposed to drivers in the client UI.

alter table public.orders
add column if not exists admin_rate_per_unit numeric(12,2)
check (admin_rate_per_unit is null or admin_rate_per_unit >= 0);

comment on column public.orders.admin_rate_per_unit is
  'Admin-only management rate per transported unit (ton/m3). Hidden from driver UI.';
