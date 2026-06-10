package com.auction.common.util;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class LoginRateLimitUtil {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Map<String, AttemptWindow> ATTEMPTS = new ConcurrentHashMap<>();

    private LoginRateLimitUtil() {
    }

    public static boolean allow(String key) {
        AttemptWindow window = ATTEMPTS.computeIfAbsent(key, k -> new AttemptWindow(Instant.now(), new AtomicInteger(0)));
        if (Instant.now().isAfter(window.startedAt.plus(WINDOW))) {
            ATTEMPTS.put(key, new AttemptWindow(Instant.now(), new AtomicInteger(0)));
            window = ATTEMPTS.get(key);
        }
        return window.counter.incrementAndGet() <= MAX_ATTEMPTS;
    }

    public static void reset(String key) {
        ATTEMPTS.remove(key);
    }

    private record AttemptWindow(Instant startedAt, AtomicInteger counter) {}
}
