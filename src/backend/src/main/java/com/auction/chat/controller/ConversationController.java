package com.auction.chat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.auction.chat.dto.request.CreateConversationRequest;
import com.auction.chat.dto.response.ConversationDetailResponse;
import com.auction.chat.dto.response.ConversationResponse;
import com.auction.account.security.UserDetailsImpl;
import com.auction.chat.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('User','Seller','Admin')")
    public ResponseEntity<ConversationResponse> create(
            @RequestBody @Valid CreateConversationRequest req,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.status(201).body(
                conversationService.createConversation(me.getId(), req));
    }

    /**
     * Conversations của tôi — phân quyền theo role:
     * <ul>
     *   <li>User/Seller: các cuộc hội thoại mình tham gia (mua/bán/support).</li>
     *   <li>Staff: các cuộc hội thoại support (không thấy BUYER_SELLER).</li>
     *   <li>Admin: tất cả.</li>
     * </ul>
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationResponse>> getMine(
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(conversationService.getMyConversations(me.getId()));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('Staff')")
    public ResponseEntity<List<ConversationResponse>> getAssigned(
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.getConversationsAssignedToStaff(me.getId()));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('Staff','Admin')")
    public ResponseEntity<List<ConversationResponse>> getUnassigned() {
        return ResponseEntity.ok(conversationService.getUnassignedConversations());
    }

    /** Admin: tổng quan tất cả conversations. */
    @GetMapping("/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<ConversationResponse>> getAll() {
        return ResponseEntity.ok(conversationService.getAllConversations());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('Staff')")
    public ResponseEntity<ConversationResponse> assign(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.assignConversationToStaff(id, me.getId()));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('Staff','Admin')")
    public ResponseEntity<ConversationResponse> close(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.closeConversation(id, me.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDetailResponse> getDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.getConversationDetail(id, me.getId()));
    }
}