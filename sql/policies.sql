-- RLS policy examples for Apartly
-- Review and adapt to your auth strategy. Apply in Supabase SQL editor.

-- NOTE: For quick testing you may disable RLS on listings so clients can read them:
-- ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

-- Enable RLS on bookings and saved_listings for safer client writes
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert bookings where guest_id = auth.uid()
CREATE POLICY "Allow insert bookings for owner" ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = guest_id);

-- Allow users to select their own bookings
CREATE POLICY "Allow select bookings for owner" ON public.bookings
  FOR SELECT
  USING (auth.uid() = guest_id);

-- Allow insert/delete of saved_listings for owner
CREATE POLICY "Allow manage saved listings" ON public.saved_listings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- If you want anonymous read access to listings (public browsing), add:
-- CREATE POLICY "Public read listings" ON public.listings
--   FOR SELECT
--   TO public
--   USING (true);

-- Be careful: RLS policies depend on using Supabase Auth and auth.uid().
-- If you are not using Supabase Auth (using anon key only), consider
-- temporarily disabling RLS on tables you need to read/write during testing.
