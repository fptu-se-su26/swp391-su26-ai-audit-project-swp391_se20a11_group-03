package com.auction.bidding.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.dto.AuctionChatMessageResponse;
import com.auction.bidding.dto.AuctionChatStatusResponse;
import com.auction.bidding.dto.SendAuctionChatMessageRequest;
import com.auction.bidding.service.AuctionChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions/{auctionId}/chat")
@RequiredArgsConstructor
public class AuctionChatController {

    private final AuctionChatService auctionChatService;

    @GetMapping("/status")
    public ResponseEntity<AuctionChatStatusResponse> getStatus(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(auctionChatService.getChatStatus(auctionId));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<AuctionChatMessageResponse>> getMessages(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(auctionChatService.getMessages(auctionId));
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable("auctionId") Long auctionId,
            @RequestBody SendAuctionChatMessageRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Yêu cầu đăng nhập"));
        }
        try {
            String content = request != null ? request.getContent() : null;
            return ResponseEntity.ok(auctionChatService.sendMessage(auctionId, user.getId(), content));
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
