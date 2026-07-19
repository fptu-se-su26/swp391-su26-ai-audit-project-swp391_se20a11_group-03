package com.auction.order.entity;

public enum OrderStatus {
    PENDING_PICKUP, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED,
    COMPLETED, DELIVERY_FAILED, REFUNDED
}
