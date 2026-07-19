package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionChatMessageResponse;
import com.auction.bidding.dto.AuctionChatStatusResponse;

import java.util.List;

public interface AuctionChatService {

    int CHAT_GRACE_MINUTES = 5;

    AuctionChatStatusResponse getChatStatus(Long auctionId);

    List<AuctionChatMessageResponse> getMessages(Long auctionId);

    AuctionChatMessageResponse sendMessage(Long auctionId, Long senderId, String content);
}
