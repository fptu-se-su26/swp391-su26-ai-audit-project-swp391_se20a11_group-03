package com.auction.account.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.LoginRequest;
import com.auction.account.dto.LoginResponse;
import com.auction.account.entity.User;
import com.auction.account.security.JwtService;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatAuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail();

        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Tài khoản bị khoá hoặc chưa được kích hoạt");
        }

        if (!passwordMatches(request.getPassword(), user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai mật khẩu");
        }

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String token = jwtService.generateToken(userDetails);

        log.info("User {} logged in successfully", user.getUsername());

        return LoginResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roleName(user.getRole().getRoleName())
                .status(user.getStatus())
                .token(token)
                .build();
    }

    private boolean passwordMatches(String rawPassword, User user) {
        String storedHash = user.getPasswordHash();
        if (storedHash == null) {
            return false;
        }

        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }

        return PasswordUtil.matches(rawPassword, user.getSalt(), storedHash, user.getPasswordIterations());
    }
}

