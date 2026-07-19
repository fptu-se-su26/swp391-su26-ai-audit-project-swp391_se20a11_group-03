package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionPaymentResponse;
import com.auction.order.dto.ShippingAddressRequest;

public interface AuctionPaymentService {
    AuctionPaymentResponse payAuction(Long auctionId, Long userId, ShippingAddressRequest address);
}
