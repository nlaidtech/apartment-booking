-- Row Level Security (RLS) Policies for Apartly PH
-- Apply in Supabase SQL editor

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
-- Anyone authenticated or anon can read public profiles
CREATE POLICY "Public profiles read" ON public.profiles
  FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Listings Policies
-- Public read access for browsing catalog
CREATE POLICY "Public read listings" ON public.listings
  FOR SELECT USING (true);

-- Only hosts can create new listings
CREATE POLICY "Hosts insert listings" ON public.listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Hosts can update their own listings
CREATE POLICY "Hosts update own listings" ON public.listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Hosts can delete their own listings
CREATE POLICY "Hosts delete own listings" ON public.listings
  FOR DELETE TO authenticated
  USING (auth.uid() = host_id);

-- 4. Bookings Policies
-- Guests can insert their own bookings
CREATE POLICY "Guests insert bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = guest_id);

-- Guests can view their own bookings
CREATE POLICY "Guests view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = guest_id);

-- Hosts can view bookings made for their properties
CREATE POLICY "Hosts view their listing bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE public.listings.id = public.bookings.listing_id
      AND public.listings.host_id = auth.uid()
    )
  );

-- Hosts can update booking status (Approve, Check-in, Decline)
CREATE POLICY "Hosts update booking status" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE public.listings.id = public.bookings.listing_id
      AND public.listings.host_id = auth.uid()
    )
  );

-- 5. Inquiries Policies
-- Guests can create inquiries
CREATE POLICY "Guests create inquiries" ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = guest_id);

-- Guests can read their own sent inquiries
CREATE POLICY "Guests read own inquiries" ON public.inquiries
  FOR SELECT TO authenticated
  USING (auth.uid() = guest_id);

-- Hosts can read inquiries addressed to them or their listings
CREATE POLICY "Hosts read inquiries" ON public.inquiries
  FOR SELECT TO authenticated
  USING (auth.uid() = host_id);

-- Hosts can reply to inquiries
CREATE POLICY "Hosts update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- 6. Saved Listings Policies
CREATE POLICY "Users manage saved listings" ON public.saved_listings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
