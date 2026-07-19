# Manual test: Orders, delivery, escrow, and staff-only chat

## Accounts

Prepare five accounts with roles `User`, `Seller`, `Staff`, `Admin`, and `Shipper`.
The buyer needs KYC and sufficient wallet balance; the seller needs KYC and a seller contract.

## Happy path

1. Seller posts a product; Staff approves it; Admin schedules an auction.
2. Buyer deposits, wins, signs the purchase contract, and pays with a complete shipping address.
3. Verify the order is `PENDING_PICKUP`, buyer paid final price plus 30,000 VND, Admin received the shipping fee, and Seller received no payout yet.
4. Staff assigns a shipper: `PENDING_PICKUP -> ASSIGNED`.
5. Assigned shipper advances one step at a time: `ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED`.
6. Buyer confirms receipt: `DELIVERED -> COMPLETED`.
7. Verify Seller receives 80%, Admin receives 20%, `PayoutReleasedAt` is set, and payout references occur only once.

## Failed delivery

1. At `IN_TRANSIT`, shipper selects delivery failure and supplies a reason.
2. Verify status becomes `DELIVERY_FAILED` and history contains the reason.
3. Test reassignment to another shipper: `DELIVERY_FAILED -> ASSIGNED`.
4. Separately test Staff refund: `DELIVERY_FAILED -> REFUNDED`.
5. Verify Buyer receives final price plus shipping fee and Seller receives no payout.

## Automatic completion

Set `DeliveredAt` to more than three days ago and run the scheduler. Verify the order becomes `COMPLETED` and payout is released exactly once.

## Authorization and chat

- Buyer/Seller can only view their own orders; shipper can only update assigned orders.
- Attempts to skip a delivery status must fail.
- A failed delivery without a reason must fail.
- Existing `BUYER_SELLER` conversations remain readable but cannot accept new messages.
- New conversations can only be created with Staff.

## Useful database checks

```sql
SELECT * FROM orders ORDER BY createdat DESC;
SELECT * FROM orderstatushistory ORDER BY createdat DESC;
SELECT transactiontype, amount, referencecode, description
FROM transactions ORDER BY createdat DESC;
```
