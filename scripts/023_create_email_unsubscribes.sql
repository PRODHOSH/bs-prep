-- Addresses that opted out of admin/broadcast email. Checked before every Inbox send.
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  email TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only the service role (server routes) touches this table.
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
