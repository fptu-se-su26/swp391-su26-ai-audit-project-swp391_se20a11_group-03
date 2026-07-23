package com.auction.event.service;

import com.auction.order.dto.ShippingAddressRequest;

public interface EventPaymentService {

    /** Winner pays real money for a won event product → charge + create delivery order. */
    void payEventProduct(Long eventProductId, Long userId, ShippingAddressRequest address);

    /** Scan overdue awaiting-payment products and forfeit the winner's stake. Returns count. */
    int forfeitOverdueEventPayments();

    /** Refund still-held registration deposits for a finished event (non-winners). */
    void refundRemainingDeposits(Long eventId);
}
