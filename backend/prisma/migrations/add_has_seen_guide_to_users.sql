-- Migration: Add has_seen_guide column to users table
-- Date: 2025-01-11
-- Description: Adds hasSeenGuide boolean field to track if user has seen the onboarding guide

-- Add the new column with default value false
ALTER TABLE "users" ADD COLUMN "has_seen_guide" BOOLEAN NOT NULL DEFAULT false;

-- Update all existing users to have seen the guide as false (so they see it)
-- This ensures all existing users will see the guide on next login
UPDATE "users" SET "has_seen_guide" = false WHERE "has_seen_guide" IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN "users"."has_seen_guide" IS 'Tracks whether user has completed the onboarding guide. Defaults to false so all users see the guide.';
