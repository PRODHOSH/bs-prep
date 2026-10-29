-- Student emails for a campaign, minus anyone who unsubscribed.
-- Run in the Supabase SQL editor, click the cell in the "emails" column, copy it,
-- then paste into the admin inbox "To" field.

-- 1) Everyone to email, comma separated, plus a count to check against
select
  count(*)                          as recipients,
  string_agg(email, ', ' order by email) as emails
from (
  select distinct lower(trim(email)) as email
  from public.profiles
  where email is not null
    and trim(email) <> ''
    and role = 'student'
    and lower(trim(email)) not in (select email from public.email_unsubscribes)
) t;

-- 2) Same list as rows, if you would rather export a CSV from the results grid
-- select distinct lower(trim(email)) as email
-- from public.profiles
-- where email is not null and trim(email) <> '' and role = 'student'
--   and lower(trim(email)) not in (select email from public.email_unsubscribes)
-- order by 1;

-- 3) Everyone including mentors and admins: remove the "role = 'student'" line above.

-- If the unsubscribe table has not been created yet, run scripts/023_create_email_unsubscribes.sql first,
-- or drop the last "and lower(trim(email)) not in (...)" line.
