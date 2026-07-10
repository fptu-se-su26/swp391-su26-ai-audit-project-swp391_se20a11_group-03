package com.auction.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Bridges Spring `application.properties` into {@link FptAiConfig} static accessors. */
@Component
public class FptAiSpringConfig {

    @Value("${app.fpt.ai.api-key:}")
    private String apiKey;

    @Value("${app.fpt.ai.api-url:}")
    private String apiUrl;

    @PostConstruct
    void register() {
        FptAiConfig.setSpringApiKey(apiKey);
        FptAiConfig.setSpringApiUrl(apiUrl);
    }
}
