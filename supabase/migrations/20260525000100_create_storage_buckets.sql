insert into storage.buckets (id, name, public)
values
  ('assessments', 'assessments', true),
  ('solutions', 'solutions', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "Assessments read" on storage.objects;
drop policy if exists "Assessments upload" on storage.objects;
drop policy if exists "Assessments update" on storage.objects;
drop policy if exists "Assessments delete" on storage.objects;
drop policy if exists "Solutions read" on storage.objects;
drop policy if exists "Solutions upload" on storage.objects;
drop policy if exists "Solutions update" on storage.objects;
drop policy if exists "Solutions delete" on storage.objects;

create policy "Assessments read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'assessments');

create policy "Assessments upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'assessments');

create policy "Assessments update"
on storage.objects
for update
to authenticated
using (bucket_id = 'assessments' and owner = auth.uid())
with check (bucket_id = 'assessments' and owner = auth.uid());

create policy "Assessments delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'assessments' and owner = auth.uid());

create policy "Solutions read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'solutions');

create policy "Solutions upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'solutions');

create policy "Solutions update"
on storage.objects
for update
to authenticated
using (bucket_id = 'solutions' and owner = auth.uid())
with check (bucket_id = 'solutions' and owner = auth.uid());

create policy "Solutions delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'solutions' and owner = auth.uid());
