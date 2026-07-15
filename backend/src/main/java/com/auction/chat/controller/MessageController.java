package com.auction.chat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.auction.chat.dto.request.SendMessageRequest;
import com.auction.chat.dto.response.MessageResponse;
import com.auction.account.security.UserDetailsImpl;
import com.auction.chat.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> send(
            @RequestBody @Valid SendMessageRequest req,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.status(201).body(messageService.sendMessage(me.getId(), req));
    }

    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable("conversationId") Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, me.getId()));
    }

    @PatchMapping("/conversation/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(
            @PathVariable("conversationId") Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl me) {
        messageService.markAsRead(conversationId, me.getId());
        return ResponseEntity.noContent().build();
    }
}

