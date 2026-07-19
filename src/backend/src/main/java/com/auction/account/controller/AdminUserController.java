package com.auction.account.controller;

import com.auction.account.dao.RoleRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.dto.AdminUserDTO;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.service.UserPaymentStrikeService;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
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
    private final JdbcTemplate jdbcTemplate;
    private final UserPaymentStrikeService userPaymentStrikeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserDTO>>> getUsers(
            @RequestParam(name = "q", required = false) String q) {
        Map<Long, String> latestKycCccd = loadLatestKycCccdByUser();
        List<AdminUserDTO> users = userRepository.findAll().stream()
                .map(user -> AdminUserDTO.from(user, latestKycCccd.get(user.getUserId())))
                .filter(dto -> matchesSearch(dto, q))
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
        if (active) {
            userPaymentStrikeService.applyAdminUnlock(user);
        }
        user.setActive(active);
        user.setStatus(active ? "ACTIVE" : "LOCKED");
        if (!active) {
            user.setLockedByPaymentStrikes(false);
        }
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

    private Map<Long, String> loadLatestKycCccdByUser() {
        Map<Long, String> map = new HashMap<>();
        if (!hasKycProfilesTable()) {
            return map;
        }
        jdbcTemplate.query(
                "SELECT k.UserId, k.CccdNumber FROM KycProfiles k "
                        + "INNER JOIN (SELECT UserId, MAX(SubmittedAt) AS MaxSubmitted FROM KycProfiles GROUP BY UserId) latest "
                        + "ON latest.UserId = k.UserId AND latest.MaxSubmitted = k.SubmittedAt",
                rs -> {
                    map.put(rs.getLong("UserId"), rs.getString("CccdNumber"));
                });
        return map;
    }

    private boolean hasKycProfilesTable() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = 'kycprofiles'",
                    Integer.class);
            return count != null && count > 0;
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean matchesSearch(AdminUserDTO dto, String q) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String needle = normalizeSearchToken(q);
        if (needle.isEmpty()) {
            return true;
        }
        return containsNormalized(dto.getFullName(), needle)
                || containsNormalized(dto.getEmail(), needle)
                || containsNormalized(dto.getPhone(), needle)
                || containsNormalized(dto.getIdentityNumber(), needle)
                || containsNormalized(dto.getLatestKycCccd(), needle);
    }

    private static String normalizeSearchToken(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT).replaceAll("\\s+", "");
    }

    private static boolean containsNormalized(String haystack, String needle) {
        if (haystack == null || haystack.isBlank()) {
            return false;
        }
        return normalizeSearchToken(haystack).contains(needle);
    }
}
