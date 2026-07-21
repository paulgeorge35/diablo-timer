-- Add per-subscription notify preferences.
-- Existing rows default to world-boss only (previous behavior).

ALTER TABLE "subscriptions"
ADD COLUMN IF NOT EXISTS "eventIds" TEXT[] NOT NULL DEFAULT ARRAY['world-boss']::TEXT[];

UPDATE "subscriptions"
SET "eventIds" = ARRAY['world-boss']::TEXT[]
WHERE "eventIds" IS NULL
   OR cardinality("eventIds") = 0;
