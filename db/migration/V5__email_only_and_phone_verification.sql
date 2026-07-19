-- PostgreSQL / Supabase migration.
-- Registration is email-only; phone is collected and verified after login.

ALTER TABLE Users
    ALTER COLUMN Phone DROP NOT NULL;

ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS PhoneVerified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS PhoneVerifiedAt TIMESTAMPTZ NULL;

-- PostgreSQL UNIQUE constraints allow multiple NULL values, so the existing
-- unique constraint on Phone can remain in place.
