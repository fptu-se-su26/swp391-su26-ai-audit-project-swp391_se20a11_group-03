package com.auction.product.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.AiValuationRequest;
import com.auction.product.dto.AiValuationResponse;
import com.auction.product.service.AiValuationQuotaService;
import com.auction.product.service.GroqValuationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiValuationController {

    private static final String QUOTA_EXCEEDED_MESSAGE =
            "Bạn đã dùng hết lượt định giá AI miễn phí.";

    private final GroqValuationService groqValuationService;
    private final AiValuationQuotaService quotaService;

    @GetMapping("/valuation/quota")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> quota(
            @AuthenticationPrincipal UserDetailsImpl me) {
        int userId = Math.toIntExact(me.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "remaining", quotaService.getRemaining(userId),
                "limit", quotaService.getLimit())));
    }

    @PostMapping("/valuation")
    public ResponseEntity<ApiResponse<AiValuationResponse>> value(
            @RequestBody AiValuationRequest request,
            @AuthenticationPrincipal UserDetailsImpl me) {
        int userId = Math.toIntExact(me.getId());
        if (quotaService.getRemaining(userId) <= 0) {
            return ResponseEntity.status(429).body(ApiResponse.error(QUOTA_EXCEEDED_MESSAGE));
        }
        try {
            AiValuationResponse result = groqValuationService.value(request);
            AiValuationQuotaService.ConsumeResult consumed = quotaService.consume(userId);
            if (!consumed.allowed()) {
                return ResponseEntity.status(429).body(ApiResponse.error(QUOTA_EXCEEDED_MESSAGE));
            }
            result.setRemaining(consumed.remaining());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(503).body(ApiResponse.error(ex.getMessage()));
        }
    }
}
