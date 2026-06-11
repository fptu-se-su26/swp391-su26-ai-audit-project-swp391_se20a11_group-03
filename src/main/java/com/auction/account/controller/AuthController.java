package com.auction.account.controller;

import com.auction.account.dto.LoginRequest;
import com.auction.account.dto.LoginResponse;
import com.auction.account.service.ChatAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final ChatAuthService authService;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/alive")
    public ResponseEntity<Map<String, String>> alive() {
        return ResponseEntity.ok(Map.of("status", "OK"));
    }
}

