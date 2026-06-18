package com.auction.account.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.dao.RoleRepository;
import com.auction.account.dto.AdminUserRoleRequest;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.dto.AdminUserResponse;
import com.auction.account.dto.AdminUserStatusRequest;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Admin')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @GetMapping
    public ApiResponse<List<AdminUserResponse>> getUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .toList();
        return ApiResponse.success(users);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> getUserStats() {
        Map<String, Long> stats = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(user -> user.getRole().getRoleName(), Collectors.counting()));
        stats.put("Total", userRepository.count());
        stats.put("Active", userRepository.findAll().stream().filter(User::isActive).count());
        return ApiResponse.success(stats);
    }

    @PatchMapping("/{userId}/status")
    public ApiResponse<AdminUserResponse> updateStatus(
            @PathVariable Integer userId,
            @Valid @RequestBody AdminUserStatusRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        if (currentUser != null && currentUser.getId().intValue() == userId && Boolean.FALSE.equals(request.active())) {
            throw new ResponseStatusException(BAD_REQUEST, "You cannot lock your own admin account");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        user.setActive(request.active());
        user.setStatus(Boolean.TRUE.equals(request.active()) ? "ACTIVE" : "LOCKED");
        User saved = userRepository.save(user);
        return ApiResponse.success("User status updated", AdminUserResponse.from(saved));
    }

    @PatchMapping("/{userId}/role")
    public ApiResponse<AdminUserResponse> updateRole(
            @PathVariable Integer userId,
            @Valid @RequestBody AdminUserRoleRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        String nextRole = request.roleName().trim();
        if (currentUser != null && currentUser.getId().intValue() == userId && !"Admin".equalsIgnoreCase(nextRole)) {
            throw new ResponseStatusException(BAD_REQUEST, "You cannot remove your own admin role");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        Role role = roleRepository.findByRoleName(nextRole)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Role not found"));

        user.setRole(role);
        User saved = userRepository.save(user);
        return ApiResponse.success("User role updated", AdminUserResponse.from(saved));
    }
}
