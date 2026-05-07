-- Recycle Bin Migration
-- Run this in your Supabase SQL Editor
-- Adds a soft-delete column to all content tables

ALTER TABLE blogs        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE reviews      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Optional: index for faster trash queries
CREATE INDEX IF NOT EXISTS idx_blogs_deleted_at        ON blogs        (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at     ON projects     (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at      ON reviews      (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_deleted_at ON team_members (deleted_at) WHERE deleted_at IS NOT NULL;
