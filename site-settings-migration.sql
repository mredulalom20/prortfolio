-- Run this in your Supabase SQL Editor to create the site_settings table

create table if not exists site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default image settings
insert into site_settings (key, value) values
  ('hero_image', 'img/profile.jpg'),
  ('about_hero_image', 'img/profile.jpg'),
  ('graphic_design_image', ''),
  ('meta_ads_image', '')
on conflict (key) do nothing;
