-- PostgreSQL / Supabase migration: Premium proxy (auto) bidding.
-- Safe to run repeatedly against an existing schema.

CREATE TABLE IF NOT EXISTS public.autobids (
    autobidid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auctionid BIGINT NOT NULL REFERENCES public.auctions(auctionid),
    userid BIGINT NOT NULL REFERENCES public.users(userid),
    maxbidamount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedat TIMESTAMPTZ NULL,
    CONSTRAINT uq_autobids_auction_user UNIQUE (auctionid, userid)
);

CREATE INDEX IF NOT EXISTS ix_autobids_auctionid ON public.autobids(auctionid);
CREATE INDEX IF NOT EXISTS ix_autobids_userid ON public.autobids(userid);
CREATE INDEX IF NOT EXISTS ix_autobids_auction_status ON public.autobids(auctionid, status);
