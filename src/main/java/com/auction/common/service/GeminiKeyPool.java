package com.auction.common.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpStatusCodeException;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

/**
 * Round-robin API key pool with sequential failover on HTTP 429.
 */
public class GeminiKeyPool {

    private static final Logger log = LoggerFactory.getLogger(GeminiKeyPool.class);

    private final String poolName;
    private final List<String> keys;
    private final AtomicInteger roundRobin = new AtomicInteger(0);

    public GeminiKeyPool(String poolName, List<String> keys) {
        this.poolName = poolName;
        this.keys = List.copyOf(keys);
    }

    public static GeminiKeyPool fromConfig(String poolName, String keysCsv, String... singleKeyFallbacks) {
        LinkedHashSet<String> unique = new LinkedHashSet<>();
        addKeysFromCsv(unique, keysCsv);
        if (singleKeyFallbacks != null) {
            for (String candidate : singleKeyFallbacks) {
                addKeyIfValid(unique, candidate);
            }
        }
        return new GeminiKeyPool(poolName, new ArrayList<>(unique));
    }

    public boolean isConfigured() {
        return !keys.isEmpty();
    }

    public int size() {
        return keys.size();
    }

    public <T> T executeWithPool(Function<String, T> action) {
        if (keys.isEmpty()) {
            throw new IllegalStateException("Chưa cấu hình Gemini API key cho pool " + poolName);
        }

        int start = Math.floorMod(roundRobin.getAndIncrement(), keys.size());
        HttpStatusCodeException lastRateLimit = null;

        for (int attempt = 0; attempt < keys.size(); attempt++) {
            String key = keys.get((start + attempt) % keys.size());
            try {
                T result = action.apply(key);
                if (attempt > 0) {
                    log.info("Gemini pool {} succeeded with failover keySuffix={} attempt={}/{}",
                            poolName, keySuffix(key), attempt + 1, keys.size());
                }
                return result;
            } catch (HttpStatusCodeException ex) {
                if (ex.getStatusCode().value() == 429) {
                    lastRateLimit = ex;
                    String body = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
                    log.warn(
                            "Gemini pool {} rate limited (429) keySuffix={} attempt={}/{} body={}",
                            poolName,
                            keySuffix(key),
                            attempt + 1,
                            keys.size(),
                            truncate(body, 300)
                    );
                    continue;
                }
                throw ex;
            }
        }

        if (lastRateLimit != null) {
            throw lastRateLimit;
        }
        throw new IllegalStateException("Gemini pool " + poolName + " exhausted all keys");
    }

    private static void addKeysFromCsv(LinkedHashSet<String> keys, String csv) {
        if (csv == null || csv.isBlank()) {
            return;
        }
        for (String part : csv.split(",")) {
            addKeyIfValid(keys, part);
        }
    }

    private static void addKeyIfValid(LinkedHashSet<String> keys, String candidate) {
        if (candidate == null) {
            return;
        }
        String trimmed = candidate.trim();
        if (trimmed.isEmpty() || "YOUR_GEMINI_API_KEY".equals(trimmed)) {
            return;
        }
        keys.add(trimmed);
    }

    static String keySuffix(String key) {
        if (key == null || key.length() < 4) {
            return "????";
        }
        return "..." + key.substring(key.length() - 4);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max) + "...";
    }
}
