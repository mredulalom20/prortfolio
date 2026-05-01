-- Run these queries in your Supabase SQL Editor

-- 1. Create Users Table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  password text not null,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Blogs Table
create table if not exists blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  "featuredImage" text,
  "metaTitle" text,
  "metaDescription" text,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Projects Table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category text not null,
  service text[] default '{}',
  images text[],
  thumbnail text,
  "externalLink" text,
  "additionalFields" jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTE: If the table already exists, run this migration:
alter table projects add column if not exists service text[] default '{}';


-- 4. Create Reviews Table
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text,
  message text not null,
  avatar_url text,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Contacts Table
create table if not exists contacts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  service text,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Products Table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category text not null,
  cover_url text,
  action_url text not null,
  action_type text default 'visit',
  badge text,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Social Links Table
create table if not exists social_links (
  id uuid default uuid_generate_v4() primary key,
  platform text unique not null,
  url text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Team Members Table
create table if not exists team_members (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  photo_url text,
  bio text not null,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
