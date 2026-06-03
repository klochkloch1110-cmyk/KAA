-- Store auth email in public profile for admin screens.

alter table public.users
add column if not exists email text;

update public.users u
set email = au.email
from auth.users au
where au.id = u.id
  and (u.email is null or u.email = '');

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

  insert into public.users (id, role, full_name, phone, email, status)
  values (new.id, app_role, display_name, phone_value, new.email, 'active'::public.user_status)
  on conflict (id) do update set
    email = coalesce(public.users.email, excluded.email);

  insert into public.driver_profiles (user_id, notes)
  select new.id, 'Профиль создан автоматически из Supabase Auth'
  where app_role = 'driver'::public.app_role
  on conflict (user_id) do nothing;

  return new;
end;
$$;
