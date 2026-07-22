-- PostgreSQL / Supabase migration: auction event module.
-- Safe to run repeatedly against an existing schema.

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS islockedinevent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.auctionevents (
    eventid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    bannerurl VARCHAR(500) NULL,
    eventcategory VARCHAR(20) NOT NULL,
    biddingmode VARCHAR(20) NOT NULL,
    ischarity BOOLEAN NOT NULL DEFAULT FALSE,
    charitypercent INT NULL,
    registrationopenat TIMESTAMPTZ NULL,
    registrationdeadline TIMESTAMPTZ NULL,
    starttime TIMESTAMPTZ NOT NULL,
    endtime TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    rulestext TEXT NULL,
    rewarddescription TEXT NULL,
    dutchconfigjson TEXT NULL,
    sealedconfigjson TEXT NULL,
    pennyconfigjson TEXT NULL,
    allowsellersubmission BOOLEAN NOT NULL DEFAULT TRUE,
    createdby BIGINT NULL REFERENCES public.users(userid),
    createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedat TIMESTAMPTZ NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.eventproducts (
    eventproductid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eventid BIGINT NOT NULL REFERENCES public.auctionevents(eventid),
    productid BIGINT NULL REFERENCES public.products(productid),
    sourcetype VARCHAR(20) NOT NULL,
    submittedbysellerid BIGINT NOT NULL REFERENCES public.users(userid),
    approvalstatus VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejectreason VARCHAR(500) NULL,
    startingprice BIGINT NOT NULL,
    currentprice BIGINT NOT NULL,
    pricestep BIGINT NULL,
    reserveprice BIGINT NULL,
    sessionstart TIMESTAMPTZ NULL,
    sessionend TIMESTAMPTZ NULL,
    sessionstatus VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    winnerid BIGINT NULL REFERENCES public.users(userid),
    finalprice BIGINT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_eventproducts_eventid
    ON public.eventproducts(eventid);
CREATE INDEX IF NOT EXISTS ix_eventproducts_productid
    ON public.eventproducts(productid);

CREATE TABLE IF NOT EXISTS public.eventregistrations (
    registrationid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eventid BIGINT NOT NULL REFERENCES public.auctionevents(eventid),
    userid BIGINT NOT NULL REFERENCES public.users(userid),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    registeredat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notifyonopen BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_eventregistrations_event_user UNIQUE (eventid, userid)
);

CREATE INDEX IF NOT EXISTS ix_eventregistrations_eventid
    ON public.eventregistrations(eventid);
CREATE INDEX IF NOT EXISTS ix_eventregistrations_userid
    ON public.eventregistrations(userid);

CREATE TABLE IF NOT EXISTS public.sealedbids (
    sealedbidid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eventproductid BIGINT NOT NULL REFERENCES public.eventproducts(eventproductid),
    userid BIGINT NOT NULL REFERENCES public.users(userid),
    bidamount BIGINT NOT NULL,
    submittedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedat TIMESTAMPTZ NULL,
    revealed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_sealedbids_eventproduct_user UNIQUE (eventproductid, userid)
);

CREATE INDEX IF NOT EXISTS ix_sealedbids_eventproductid
    ON public.sealedbids(eventproductid);
CREATE INDEX IF NOT EXISTS ix_sealedbids_userid
    ON public.sealedbids(userid);

CREATE TABLE IF NOT EXISTS public.pennybids (
    pennybidid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eventproductid BIGINT NOT NULL REFERENCES public.eventproducts(eventproductid),
    userid BIGINT NOT NULL REFERENCES public.users(userid),
    priceafterbid BIGINT NOT NULL,
    bidat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_pennybids_eventproductid
    ON public.pennybids(eventproductid);
CREATE INDEX IF NOT EXISTS ix_pennybids_userid
    ON public.pennybids(userid);
