-- PostgreSQL / Supabase migration: fraud detection and admin control.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bidrestricteduntil TIMESTAMPTZ NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspendedat TIMESTAMPTZ NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspensionreason VARCHAR(500) NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bannedat TIMESTAMPTZ NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bannedby BIGINT NULL REFERENCES public.users(userid);

ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS ipaddress VARCHAR(64) NULL;
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS devicehash VARCHAR(64) NULL;

CREATE INDEX IF NOT EXISTS ix_bids_auction_time ON public.bids(auctionid, bidtime DESC);
CREATE INDEX IF NOT EXISTS ix_bids_auction_ip_time ON public.bids(auctionid, ipaddress, bidtime DESC);
CREATE INDEX IF NOT EXISTS ix_bids_auction_device ON public.bids(auctionid, devicehash);
CREATE INDEX IF NOT EXISTS ix_bids_user_time ON public.bids(userid, bidtime DESC);

CREATE TABLE IF NOT EXISTS public.systemsettings (
    settingid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    settingkey VARCHAR(100) NOT NULL UNIQUE,
    settingvalue VARCHAR(255) NOT NULL,
    updatedby BIGINT NULL REFERENCES public.users(userid),
    updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.systemsettingauditlogs (
    settingauditid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    settingkey VARCHAR(100) NOT NULL,
    oldvalue VARCHAR(255) NULL,
    newvalue VARCHAR(255) NOT NULL,
    changedby BIGINT NOT NULL REFERENCES public.users(userid),
    reason VARCHAR(500) NULL,
    changedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fraudalerts (
    fraudalertid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auctionid BIGINT NOT NULL REFERENCES public.auctions(auctionid),
    suspecteduserid BIGINT NOT NULL REFERENCES public.users(userid),
    triggerbidid BIGINT NULL REFERENCES public.bids(bidid),
    fraudtype VARCHAR(100) NOT NULL,
    signals VARCHAR(1000) NOT NULL,
    riskscore INT NOT NULL,
    risklevel VARCHAR(20) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    automaticaction VARCHAR(50) NOT NULL DEFAULT 'WARN_ADMIN',
    occurrencecount INT NOT NULL DEFAULT 1,
    firstdetectedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lastdetectedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewedby BIGINT NULL REFERENCES public.users(userid),
    reviewedat TIMESTAMPTZ NULL,
    adminnote VARCHAR(1000) NULL
);

CREATE INDEX IF NOT EXISTS ix_fraudalerts_status_risk_time
    ON public.fraudalerts(status, risklevel, lastdetectedat DESC);
CREATE INDEX IF NOT EXISTS ix_fraudalerts_auction_user
    ON public.fraudalerts(auctionid, suspecteduserid);

INSERT INTO public.systemsettings(settingkey, settingvalue)
VALUES
    ('FRAUD_DETECTION_ENABLED', 'true'),
    ('AUTO_RESTRICTION_ENABLED', 'false'),
    ('FRAUD_ALERT_ENABLED', 'true')
ON CONFLICT (settingkey) DO NOTHING;
