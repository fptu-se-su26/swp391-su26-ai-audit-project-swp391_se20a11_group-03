package com.auction.account.controller;

import com.auction.account.dao.RoleRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.dto.AdminUserDTO;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin user management. Secured for the Admin role in SecurityConfig
 * (requestMatchers("/api/admin/users/**").hasRole("Admin")).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserDTO>>> getUsers() {
        List<AdminUserDTO> users = userRepository.findAll().stream()
                .map(AdminUserDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        List<User> users = userRepository.findAll();
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("Total", (long) users.size());
        stats.put("Active", users.stream().filter(User::isActive).count());
        for (String role : List.of("User", "Seller", "Staff", "Admin")) {
            long count = users.stream()
                    .filter(u -> u.getRole() != null && role.equalsIgnoreCase(u.getRole().getRoleName()))
                    .count();
            stats.put(role, count);
        }
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PatchMapping("/{userId}/status")
    @Transactional
    public ResponseEntity<ApiResponse<AdminUserDTO>> updateStatus(
            @PathVariable("userId") Integer userId,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        boolean active = Boolean.TRUE.equals(body.get("active"));
        user.setActive(active);
        user.setStatus(active ? "ACTIVE" : "LOCKED");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User status updated", AdminUserDTO.from(user)));
    }

    @PatchMapping("/{userId}/role")
    @Transactional
    public ResponseEntity<ApiResponse<AdminUserDTO>> updateRole(
            @PathVariable("userId") Integer userId,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Object roleNameRaw = body.get("roleName");
        if (roleNameRaw == null || roleNameRaw.toString().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("roleName is required"));
        }
        String roleName = roleNameRaw.toString().trim();
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User role updated", AdminUserDTO.from(user)));
    }
}
