package com.auction.order.controller;
import com.auction.account.dao.UserRepository;
import com.auction.account.security.UserDetailsImpl;
import com.auction.order.dto.OrderActionRequest;
import com.auction.order.dto.OrderResponse;
import com.auction.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/staff") @RequiredArgsConstructor
public class StaffOrderController {
    private final OrderService service; private final UserRepository users;
    @GetMapping("/orders") public List<OrderResponse> orders(@RequestParam(required=false) String status) { return service.staffOrders(status); }
    @PostMapping("/orders/{id}/assign") public OrderResponse assign(@PathVariable Long id, @RequestBody OrderActionRequest req, @AuthenticationPrincipal UserDetailsImpl actor) { if (req.getShipperId() == null) throw new IllegalArgumentException("shipperId is required"); return service.assign(id, req.getShipperId(), actor.getId(), req.getNote()); }
    @PostMapping("/orders/{id}/failed-action") public OrderResponse failed(@PathVariable Long id, @RequestBody OrderActionRequest req, @AuthenticationPrincipal UserDetailsImpl actor) { if ("REFUND".equalsIgnoreCase(req.getAction())) return service.refund(id, actor.getId(), req.getNote()); if ("REASSIGN".equalsIgnoreCase(req.getAction()) && req.getShipperId() != null) return service.assign(id, req.getShipperId(), actor.getId(), req.getNote()); throw new IllegalArgumentException("action must be REASSIGN or REFUND"); }
    @GetMapping("/shippers") public List<Map<String,Object>> shippers() { return users.findAllByRole_RoleName("Shipper").stream().map(u -> { Map<String,Object> row = new LinkedHashMap<>(); row.put("id", u.getUserId()); row.put("username", u.getUsername()); row.put("email", u.getEmail()); return row; }).toList(); }
}
