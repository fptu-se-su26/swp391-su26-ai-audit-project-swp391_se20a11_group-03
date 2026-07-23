-- PostgreSQL / Supabase migration: Event money mode (VIRTUAL/REAL), registration
-- deposits, event-product payment lifecycle, and event orders.
-- All additive / nullable — safe to run repeatedly against an existing schema.

-- Event: money mode + registration deposit amount (VIRTUAL only).
ALTER TABLE public.auctionevents
    ADD COLUMN IF NOT EXISTS moneymode VARCHAR(10) NOT NULL DEFAULT 'REAL';
ALTER TABLE public.auctionevents
    ADD COLUMN IF NOT EXISTS depositamount BIGINT NULL;

-- Registration: held real-money deposit for VIRTUAL events.
ALTER TABLE public.eventregistrations
    ADD COLUMN IF NOT EXISTS depositamount BIGINT NULL;
ALTER TABLE public.eventregistrations
    ADD COLUMN IF NOT EXISTS depositstatus VARCHAR(20) NULL;

-- Event product: REAL-money bid hold + payment lifecycle after a winner is set.
ALTER TABLE public.eventproducts
    ADD COLUMN IF NOT EXISTS heldamount BIGINT NULL;
ALTER TABLE public.eventproducts
    ADD COLUMN IF NOT EXISTS paymentstatus VARCHAR(20) NULL;
ALTER TABLE public.eventproducts
    ADD COLUMN IF NOT EXISTS paymentdeadline TIMESTAMPTZ NULL;
ALTER TABLE public.eventproducts
    ADD COLUMN IF NOT EXISTS settledat TIMESTAMPTZ NULL;

-- Orders: allow event-product orders (no auction). AuctionId becomes optional;
-- a nullable EventProductId links delivery orders created from event wins.
ALTER TABLE public.orders
    ALTER COLUMN auctionid DROP NOT NULL;
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS eventproductid BIGINT NULL REFERENCES public.eventproducts(eventproductid);
CREATE INDEX IF NOT EXISTS ix_orders_eventproductid ON public.orders(eventproductid);
