package com.auction.config;

public final class FptAiConfig {
    private static final String API_KEY_ENV = "FPT_AI_API_KEY";
    private static final String API_URL_ENV = "FPT_AI_API_URL";
    private static final String DEFAULT_API_URL = "https://api.fpt.ai";

    private static volatile String springApiKey;
    private static volatile String springApiUrl;

    private FptAiConfig() {
    }

    static void setSpringApiKey(String key) {
        springApiKey = key;
    }

    static void setSpringApiUrl(String url) {
        springApiUrl = url;
    }

    public static String getApiKey() {
        return firstNonBlank(
                System.getProperty("fpt.ai.api.key"),
                System.getenv(API_KEY_ENV),
                springApiKey
        );
    }

    public static String getApiUrl() {
        return firstNonBlank(
                System.getProperty("fpt.ai.api.url"),
                System.getenv(API_URL_ENV),
                springApiUrl,
                DEFAULT_API_URL
        );
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }
}
