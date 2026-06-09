package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.CreateConversationRequest;
import org.example.backend.dto.response.ConversationDetailResponse;
import org.example.backend.dto.response.ConversationResponse;
import org.example.backend.security.UserDetailsImpl;
import org.example.backend.service.ConversationService;
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
    @PreAuthorize("hasAnyRole('User','Seller')")
    public ResponseEntity<ConversationResponse> create(
            @RequestBody @Valid CreateConversationRequest req,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.status(201).body(
                conversationService.createConversation(me.getId(), req));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('User','Seller')")
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

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('Staff')")
    public ResponseEntity<ConversationResponse> assign(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.assignConversationToStaff(id, me.getId()));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('Staff','Admin')")
    public ResponseEntity<ConversationResponse> close(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(conversationService.closeConversation(id, me.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDetailResponse> getDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                conversationService.getConversationDetail(id, me.getId()));
    }
}
