package com.auction.order.controller;
import com.auction.account.security.UserDetailsImpl;
import com.auction.order.dto.OrderActionRequest;
import com.auction.order.dto.OrderResponse;
import com.auction.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/shipper/orders") @RequiredArgsConstructor
public class ShipperOrderController {
    private final OrderService service;
    @GetMapping public List<OrderResponse> mine(@AuthenticationPrincipal UserDetailsImpl user) { return service.shipperOrders(user.getId()); }
    @PostMapping("/{id}/status") public OrderResponse status(@PathVariable Long id, @RequestBody OrderActionRequest req, @AuthenticationPrincipal UserDetailsImpl user) { return service.shipperTransition(id, req.getStatus(), user.getId(), req.getNote()); }
}
