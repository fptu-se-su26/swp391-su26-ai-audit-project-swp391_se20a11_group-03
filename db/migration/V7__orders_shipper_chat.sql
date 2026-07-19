UPDATE conversations SET status = 'CLOSED', updatedat = NOW()
WHERE conversationtype = 'BUYER_SELLER' AND status <> 'CLOSED';

INSERT INTO roles (rolename) VALUES ('Shipper') ON CONFLICT (rolename) DO NOTHING;

CREATE TABLE IF NOT EXISTS orders (
    orderid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auctionid BIGINT NOT NULL UNIQUE REFERENCES auctions(auctionid),
    buyerid BIGINT NOT NULL REFERENCES users(userid),
    sellerid BIGINT NOT NULL REFERENCES users(userid),
    shipperid BIGINT NULL REFERENCES users(userid),
    productid BIGINT NOT NULL REFERENCES products(productid),
    finalprice BIGINT NOT NULL CHECK (finalprice >= 0),
    shippingfee BIGINT NOT NULL CHECK (shippingfee >= 0),
    receivername VARCHAR(150) NOT NULL,
    receiverphone VARCHAR(30) NOT NULL,
    addressline VARCHAR(255) NOT NULL,
    ward VARCHAR(120) NOT NULL,
    district VARCHAR(120) NOT NULL,
    province VARCHAR(120) NOT NULL,
    note VARCHAR(500) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PICKUP',
    assignedat TIMESTAMPTZ NULL,
    deliveredat TIMESTAMPTZ NULL,
    payoutreleasedat TIMESTAMPTZ NULL,
    createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_orders_buyer ON orders(buyerid, createdat DESC);
CREATE INDEX IF NOT EXISTS ix_orders_seller ON orders(sellerid, createdat DESC);
CREATE INDEX IF NOT EXISTS ix_orders_shipper_status ON orders(shipperid, status);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status, createdat DESC);

CREATE TABLE IF NOT EXISTS orderstatushistory (
    historyid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orderid BIGINT NOT NULL REFERENCES orders(orderid) ON DELETE CASCADE,
    fromstatus VARCHAR(30) NULL,
    tostatus VARCHAR(30) NOT NULL,
    changedby BIGINT NULL REFERENCES users(userid),
    note VARCHAR(500) NULL,
    createdat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_orderstatushistory_order
    ON orderstatushistory(orderid, createdat ASC);
