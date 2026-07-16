package com.auction.product.controller;

import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.AiValuationRequest;
import com.auction.product.dto.AiValuationResponse;
import com.auction.product.service.GroqValuationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiValuationController {

    private final GroqValuationService groqValuationService;

    @PostMapping("/valuation")
    public ResponseEntity<ApiResponse<AiValuationResponse>> value(@RequestBody AiValuationRequest request) {
        try {
            AiValuationResponse result = groqValuationService.value(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(503).body(ApiResponse.error(ex.getMessage()));
        }
    }
}
