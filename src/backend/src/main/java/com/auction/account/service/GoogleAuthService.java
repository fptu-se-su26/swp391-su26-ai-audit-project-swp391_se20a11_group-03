package com.auction.account.service;

import com.auction.account.dao.RoleRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.dto.LoginResponse;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.security.JwtService;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.util.PasswordUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handles "Sign in with Google" by verifying the Google ID token (credential)
 * issued by Google Identity Services on the frontend, then logging in an
 * existing user or provisioning a new one.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private static final String TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /** Configured Google OAuth client id; when blank the audience check is skipped (dev only). */
    @Value("${app.google.client-id:}")
    private String googleClientId;

    public LoginResponse loginWithGoogle(String credential) {
        if (credential == null || credential.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu Google credential.");
        }

        JsonNode payload = verifyCredential(credential);

        String email = textValue(payload, "email");
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google không trả về email hợp lệ.");
        }
        boolean emailVerified = Boolean.parseBoolean(textValue(payload, "email_verified"));
        if (!emailVerified) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email Google chưa được xác minh.");
        }

        String fullName = textValue(payload, "name");
        if (fullName == null || fullName.isBlank()) {
            fullName = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        }

        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        boolean newUser = false;

        if (user == null) {
            user = createGoogleUser(fullName, normalizedEmail);
            newUser = true;
            log.info("Provisioned new Google user {}", normalizedEmail);
        } else if (!"ACTIVE".equals(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Tài khoản bị khoá hoặc chưa được kích hoạt.");
        }

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roleName(user.getRole().getRoleName())
                .status(user.getStatus())
                .token(token)
                .identityVerified(user.isIdentityVerified())
                .phoneVerified(user.isPhoneVerified())
                .profileStatus(user.getProfileStatus())
                .newUser(newUser)
                .build();
    }

    private JsonNode verifyCredential(String credential) {
        try {
            String url = TOKEN_INFO_URL + URLEncoder.encode(credential, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google credential không hợp lệ.");
            }

            JsonNode payload = objectMapper.readTree(response.body());

            String audience = textValue(payload, "aud");
            if (googleClientId != null && !googleClientId.isBlank()
                    && (audience == null || !googleClientId.equals(audience))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Google credential không dành cho ứng dụng này.");
            }

            return payload;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (java.io.IOException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể xác minh Google credential. Vui lòng thử lại.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể xác minh Google credential. Vui lòng thử lại.", ex);
        }
    }

    private User createGoogleUser(String fullName, String email) {
        Role userRole = roleRepository.findByRoleName("User")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Không tìm thấy role User trong hệ thống."));

        // Google accounts have no local password; store a random, unusable hash.
        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        String passwordHash = PasswordUtil.hashPassword(UUID.randomUUID().toString(), salt, iterations);

        User user = new User(fullName, email, null, null, passwordHash, salt, iterations);
        user.setAuthProvider("GOOGLE");
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setVerificationLevel((byte) 0);
        user.setProfileStatus("PENDING_PHONE_VERIFY");
        user.setRole(userRole);

        return userRepository.save(user);
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }
}
