-- Apartly SQL schema for Supabase
-- Run this in Supabase SQL editor

-- enable uuid generator
create extension if not exists pgcrypto;

-- profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  role text default 'guest',
  avatar_url text,
  rating numeric,
  reviews_count int,
  phone text,
  gender text,
  bio text,
  created_at timestamptz default now()
);

-- listings
create table if not exists listings (
  id bigserial primary key,
  host_id uuid references profiles(id),
  name text not null,
  location text,
  room_type text,
  amenities text[], -- array of strings
  rating numeric,
  reviews_count int,
  price numeric,
  image_url text,
  description text,
  created_at timestamptz default now()
);

-- bookings
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
  guests int,
  price_per_night numeric,
  nights int,
  total_price numeric,
  status text,
  notes text,
  created_at timestamptz default now()
);

-- saved_listings
create table if not exists saved_listings (
  id bigserial primary key,
  user_id uuid references profiles(id),
  listing_id bigint references listings(id),
  created_at timestamptz default now()
);

-- GIN index for text[] amenities
create index if not exists idx_listings_amenities on listings using gin (amenities);
