-- Keep Supabase Auth users visible to the application.
--
-- The React app reads operational users from public.users. Creating a user only
-- in Supabase Auth is not enough for RLS, role checks, driver lists, or order
-- assignment. This trigger creates a minimal public profile for every new auth
-- user and this migration also backfills profiles for already-created auth users.

create or replace function public.sync_auth_user_to_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  app_role public.app_role;
  display_name text;
  phone_value text;
begin
  raw_role := coalesce(new.raw_user_meta_data->>'role', 'driver');
  app_role := case raw_role
    when 'admin' then 'admin'::public.app_role
    when 'operator' then 'operator'::public.app_role
    else 'driver'::public.app_role
  end;

  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Новый пользователь'
  );

  phone_value := coalesce(nullif(new.raw_user_meta_data->>'phone', ''), '');

  insert into public.users (id, role, full_name, phone, status)
  values (new.id, app_role, display_name, phone_value, 'active'::public.user_status)
  on conflict (id) do nothing;

  insert into public.driver_profiles (user_id, notes)
  select new.id, 'Профиль создан автоматически из Supabase Auth'
  where app_role = 'driver'::public.app_role
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_public_profile on auth.users;

create trigger on_auth_user_created_sync_public_profile
after insert on auth.users
for each row execute function public.sync_auth_user_to_public_profile();

insert into public.users (id, role, full_name, phone, status)
select
  au.id,
  case coalesce(au.raw_user_meta_data->>'role', 'driver')
    when 'admin' then 'admin'::public.app_role
    when 'operator' then 'operator'::public.app_role
    else 'driver'::public.app_role
  end,
  coalesce(
    nullif(au.raw_user_meta_data->>'full_name', ''),
    nullif(au.raw_user_meta_data->>'name', ''),
    nullif(split_part(au.email, '@', 1), ''),
    'Новый пользователь'
  ),
  coalesce(nullif(au.raw_user_meta_data->>'phone', ''), ''),
  'active'::public.user_status
from auth.users au
where not exists (select 1 from public.users u where u.id = au.id);

insert into public.driver_profiles (user_id, notes)
select u.id, 'Профиль создан автоматически из Supabase Auth'
from public.users u
where u.role = 'driver'
  and not exists (select 1 from public.driver_profiles dp where dp.user_id = u.id);
