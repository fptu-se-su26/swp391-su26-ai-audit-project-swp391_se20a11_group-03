-- PostgreSQL / Supabase migration.
-- Stores short-lived OTP challenges completed before account creation.

CREATE TABLE IF NOT EXISTS PendingEmailVerifications (
    VerificationId         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Email                  VARCHAR(255) NOT NULL,
    OtpSalt                VARCHAR(64)  NOT NULL,
    OtpHash                VARCHAR(64)  NOT NULL,
    RegistrationTokenHash  VARCHAR(64)  NULL,
    AttemptCount           INT          NOT NULL DEFAULT 0,
    ExpiresAt              TIMESTAMPTZ  NOT NULL,
    VerifiedAt             TIMESTAMPTZ  NULL,
    ConsumedAt             TIMESTAMPTZ  NULL,
    CreatedAt              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IX_PendingEmailVerifications_Email_CreatedAt
    ON PendingEmailVerifications (Email, CreatedAt DESC);

CREATE UNIQUE INDEX IF NOT EXISTS UX_PendingEmailVerifications_RegistrationToken
    ON PendingEmailVerifications (RegistrationTokenHash)
    WHERE RegistrationTokenHash IS NOT NULL;
