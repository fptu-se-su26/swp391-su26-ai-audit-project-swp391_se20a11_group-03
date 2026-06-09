package com.auction.account.util;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class LoginRateLimitUtil {
    private static final int MAX_ATTEMPTS = AppConfig.getInt("vnec.login.maxAttempts", 5);
    private static final int WINDOW_MINUTES = AppConfig.getInt("vnec.login.windowMinutes", 15);
    private static final int LOCK_MINUTES = AppConfig.getInt("vnec.login.lockMinutes", 15);

    private static final Map<String, AttemptBucket> ATTEMPTS = new ConcurrentHashMap<>();

    private LoginRateLimitUtil() {
    }

    public static RateLimitStatus checkAllowed(String key) {
        if (key == null || key.trim().isEmpty()) {
            return RateLimitStatus.allowed();
        }
        AttemptBucket bucket = ATTEMPTS.computeIfAbsent(normalize(key), ignored -> new AttemptBucket());
        synchronized (bucket) {
            bucket.prune();
            if (bucket.lockUntil != null && Instant.now().isBefore(bucket.lockUntil)) {
                return RateLimitStatus.blocked(Duration.between(Instant.now(), bucket.lockUntil));
            }
            return RateLimitStatus.allowed();
        }
    }

    public static void recordFailure(String key) {
        if (key == null || key.trim().isEmpty()) {
            return;
        }
        AttemptBucket bucket = ATTEMPTS.computeIfAbsent(normalize(key), ignored -> new AttemptBucket());
        synchronized (bucket) {
            bucket.prune();
            bucket.failures.incrementAndGet();
            bucket.lastAttempt = Instant.now();
            if (bucket.failures.get() >= MAX_ATTEMPTS) {
                bucket.lockUntil = Instant.now().plus(Duration.ofMinutes(LOCK_MINUTES));
                bucket.failures.set(0);
            }
        }
    }

    public static void recordSuccess(String key) {
        if (key == null || key.trim().isEmpty()) {
            return;
        }
        ATTEMPTS.remove(normalize(key));
    }

    private static String normalize(String key) {
        return key.trim().toLowerCase();
    }

    private static final class AttemptBucket {
        private final AtomicInteger failures = new AtomicInteger(0);
        private Instant firstAttempt = Instant.now();
        private Instant lastAttempt = Instant.now();
        private Instant lockUntil;

        private void prune() {
            Instant now = Instant.now();
            if (Duration.between(firstAttempt, now).toMinutes() >= WINDOW_MINUTES) {
                failures.set(0);
                firstAttempt = now;
                lockUntil = null;
            }
        }
    }

    public static final class RateLimitStatus {
        private final boolean allowed;
        private final Duration retryAfter;

        private RateLimitStatus(boolean allowed, Duration retryAfter) {
            this.allowed = allowed;
            this.retryAfter = retryAfter;
        }

        public static RateLimitStatus allowed() {
            return new RateLimitStatus(true, Duration.ZERO);
        }

        public static RateLimitStatus blocked(Duration retryAfter) {
            return new RateLimitStatus(false, retryAfter == null ? Duration.ZERO : retryAfter);
        }

        public boolean isAllowed() {
            return allowed;
        }

        public Duration getRetryAfter() {
            return retryAfter;
        }
    }
}


