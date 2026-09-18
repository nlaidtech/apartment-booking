-- Apartly PH SQL Schema for Supabase
-- Run this in Supabase SQL editor to create all required tables

-- Enable UUID generator extension
create extension if not exists pgcrypto;

-- 1. Profiles (Supports both Student Tenants and Landladies)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  role text default 'guest', -- 'guest' (Student) or 'host' (Landlady)
  avatar_url text,
  rating numeric default 5.0,
  reviews_count int default 0,
  phone text,
  gender text,
  bio text,
  -- Student Tenant Verification (KYC) Fields
  school text,
  course text,
  student_id text,
  id_document_url text,
  id_verified boolean default false,
  emergency_contact text,
  -- Landlady / Host Operator Fields
  permit_number text,
  landlady_years int default 5,
  created_at timestamptz default now()
);

-- 2. Listings (Boarding Houses, Bedspaces, Transient Rooms)
create table if not exists listings (
  id bigserial primary key,
  host_id uuid references profiles(id),
  name text not null,
  location text not null,      -- e.g. 'Tagum City', 'Davao City', 'Cebu City'
  room_type text not null,     -- 'Bedspace', 'Solo Room', 'Studio Pad', '1 Bedroom', 'Capsule Pod'
  amenities text[],            -- array: ['WiFi', 'Aircon', 'Own CR', 'Mineral Water', 'CCTV']
  rating numeric default 0,
  reviews_count int default 0,
  price numeric not null,      -- Philippine Pesos (₱) per night
  monthly_price numeric,       -- Philippine Pesos (₱) per month
  image_url text,
  description text,
  -- Boarding House Rules & Proximity
  campus_nearby text,          -- e.g. 'UM Tagum (3 min walk)', 'Davao Doctors College'
  curfew text,                 -- e.g. '10:00 PM Curfew' or 'No Curfew (24/7 Keycard)'
  utilities text,              -- e.g. 'Submetered electricity, free water'
  created_at timestamptz default now()
);

-- 3. Bookings / Reservations
create table if not exists bookings (
  id text primary key,
  listing_id bigint references listings(id),
  guest_id uuid references profiles(id),
  property_name text,
  guest_name text,
  guest_email text,
  guest_phone text,
  guest_gender text,
  check_in text,
  check_out text,
  guests int default 1,
  price_per_night numeric,
  nights int default 1,
  total_price numeric,
  payment_method text default 'gcash',
  lease_type text default 'transient', -- 'transient', 'monthly', 'holding'
  lease_name text,
  move_in_balance numeric default 0,
  deposit_details jsonb,
  status text default 'Confirmed',     -- 'Confirmed', 'Checked-in', 'Declined', 'Pending'
  notes text,
  created_at timestamptz default now()
);

-- 4. Inquiries & Two-Way Chat (Student Questions to Landladies)
create table if not exists inquiries (
  id text primary key,
  listing_id bigint references listings(id),
  host_id uuid references profiles(id),
  guest_id uuid references profiles(id),
  property_name text,
  guest_name text,
  guest_phone text,
  message text not null,
  reply text,
  messages jsonb default '[]'::jsonb,
  unread_by_guest int default 0,
  unread_by_host int default 0,
  status text default 'Sent',          -- 'Sent' or 'Replied'
  date_sent date default current_date,
  created_at timestamptz default now()
);

-- 5. Saved Listings / Bookmarks
create table if not exists saved_listings (
  id bigserial primary key,
  user_id uuid references profiles(id),
  listing_id bigint references listings(id),
  created_at timestamptz default now()
);

-- 6. Reviews (Student Feedback & Ratings)
create table if not exists reviews (
  id text primary key,
  listing_id bigint references listings(id),
  author_name text,
  author_role text,
  rating numeric not null,
  cleanliness numeric default 5,
  wifi numeric default 5,
  landlady numeric default 5,
  comment text,
  created_at timestamptz default now()
);

-- Indexes for Fast Querying
create index if not exists idx_listings_amenities on listings using gin (amenities);
create index if not exists idx_listings_location on listings(location);
create index if not exists idx_inquiries_host_id on inquiries(host_id);
create index if not exists idx_inquiries_guest_id on inquiries(guest_id);
create index if not exists idx_bookings_guest_id on bookings(guest_id);
create index if not exists idx_bookings_listing_id on bookings(listing_id);
create index if not exists idx_reviews_listing_id on reviews(listing_id);
