package com.auction.common.config;

import com.auction.common.service.GeminiKeyPool;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiKeyPoolConfig {

    @Bean
    @Qualifier("ocr")
    public GeminiKeyPool ocrGeminiKeyPool(
            @Value("${gemini.ocr.api.keys:}") String keysCsv,
            @Value("${gemini.ocr.api.key:${gemini.api.key:}}") String singleKey,
            @Value("${gemini.api.key:}") String sharedFallback
    ) {
        return GeminiKeyPool.fromConfig("ocr", keysCsv, singleKey, sharedFallback);
    }

    @Bean
    @Qualifier("valuation")
    public GeminiKeyPool valuationGeminiKeyPool(
            @Value("${gemini.valuation.api.keys:}") String keysCsv,
            @Value("${gemini.valuation.api.key:${gemini.api.key:}}") String singleKey,
            @Value("${gemini.api.key:}") String sharedFallback
    ) {
        return GeminiKeyPool.fromConfig("valuation", keysCsv, singleKey, sharedFallback);
    }

    @Bean
    @Qualifier("chat")
    public GeminiKeyPool chatGeminiKeyPool(
            @Value("${gemini.chat.api.keys:}") String keysCsv,
            @Value("${gemini.chat.api.key:${gemini.api.key:}}") String singleKey,
            @Value("${gemini.api.key:}") String sharedFallback
    ) {
        return GeminiKeyPool.fromConfig("chat", keysCsv, singleKey, sharedFallback);
    }
}
