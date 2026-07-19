package com.auction.order.controller;
import com.auction.account.security.UserDetailsImpl;
import com.auction.order.dto.OrderResponse;
import com.auction.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderService service;
    @GetMapping public List<OrderResponse> mine(@AuthenticationPrincipal UserDetailsImpl user) { return service.myOrders(user.getId()); }
    @GetMapping("/{id}") public OrderResponse one(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) { return service.getMine(id, user.getId()); }
    @PostMapping("/{id}/confirm-received") public OrderResponse confirm(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) { return service.confirmReceived(id, user.getId()); }
    @GetMapping("/shipping-fee") public ResponseEntity<?> fee() { return ResponseEntity.ok(java.util.Map.of("shippingFee", service.getShippingFee())); }
}
