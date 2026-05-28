-- Allow canonical trip document paths in the private `documents` bucket.
-- Path format used by the Flutter client:
--   trips/{tripId}/ttn/{timestamp}_{fileName}

drop policy if exists storage_documents_select_own_prefix_or_staff on storage.objects;
drop policy if exists storage_documents_insert_own_prefix on storage.objects;

create policy storage_documents_select_related_trip_shift_or_staff
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and (
    public.is_operator_or_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
    or (
      (storage.foldername(name))[1] = 'trips'
      and exists (
        select 1
        from public.trips t
        where t.id::text = (storage.foldername(name))[2]
          and t.driver_id = auth.uid()
      )
    )
    or (
      (storage.foldername(name))[1] = 'shifts'
      and exists (
        select 1
        from public.shifts s
        where s.id::text = (storage.foldername(name))[2]
          and s.driver_id = auth.uid()
      )
    )
  )
);

create policy storage_documents_insert_related_trip_shift_or_staff
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (
    public.is_operator_or_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
    or (
      (storage.foldername(name))[1] = 'trips'
      and exists (
        select 1
        from public.trips t
        where t.id::text = (storage.foldername(name))[2]
          and t.driver_id = auth.uid()
      )
    )
    or (
      (storage.foldername(name))[1] = 'shifts'
      and exists (
        select 1
        from public.shifts s
        where s.id::text = (storage.foldername(name))[2]
          and s.driver_id = auth.uid()
      )
    )
  )
);
