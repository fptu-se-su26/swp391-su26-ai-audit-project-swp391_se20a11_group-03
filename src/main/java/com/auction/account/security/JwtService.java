package com.auction.account.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        String subject = resolveTokenSubject(userDetails);
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String subject = extractUsername(token);
            return matchesSubject(subject, userDetails) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private static String resolveTokenSubject(UserDetails userDetails) {
        if (userDetails instanceof UserDetailsImpl impl
                && impl.getEmail() != null
                && !impl.getEmail().isBlank()) {
            return impl.getEmail();
        }
        return userDetails.getUsername();
    }

    private static boolean matchesSubject(String subject, UserDetails userDetails) {
        if (subject == null) {
            return false;
        }
        if (userDetails instanceof UserDetailsImpl impl) {
            return subject.equalsIgnoreCase(impl.getEmail())
                    || subject.equalsIgnoreCase(impl.getUsername());
        }
        return subject.equalsIgnoreCase(userDetails.getUsername());
    }

    private boolean isTokenExpired(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration()
                .before(new Date());
    }
}

