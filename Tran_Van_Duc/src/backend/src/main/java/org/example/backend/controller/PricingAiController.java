package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.PricingChatRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.PricingChatResponse;
import org.example.backend.security.UserDetailsImpl;
import org.example.backend.service.PricingAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chatbot AI hỗ trợ định giá sản phẩm cho người bán.
 */
@RestController
@RequestMapping("/api/v1/ai/pricing")
@RequiredArgsConstructor
public class PricingAiController {

    private final PricingAiService pricingAiService;

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('Seller','User','Admin')")
    public ResponseEntity<PricingChatResponse> chat(
            @RequestBody @Valid PricingChatRequest req,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(pricingAiService.chat(me.getId(), req));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("hasAnyRole('Seller','User','Admin')")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(pricingAiService.getMessages(me.getId(), id));
    }
}
