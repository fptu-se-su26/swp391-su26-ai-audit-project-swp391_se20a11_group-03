package com.auction.common.config;

import com.auction.common.service.GroqKeyPool;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GroqKeyPoolConfig {

    @Bean
    @Qualifier("ocr")
    public GroqKeyPool ocrGroqKeyPool(
            @Value("${groq.ocr.api.keys:${groq.api.keys:}}") String keysCsv,
            @Value("${groq.ocr.api.key:${groq.api.key:}}") String singleKey,
            @Value("${groq.api.key:}") String sharedFallback
    ) {
        return GroqKeyPool.fromConfig("ocr", keysCsv, singleKey, sharedFallback);
    }

    @Bean
    @Qualifier("valuation")
    public GroqKeyPool valuationGroqKeyPool(
            @Value("${groq.valuation.api.keys:${groq.api.keys:}}") String keysCsv,
            @Value("${groq.valuation.api.key:${groq.api.key:}}") String singleKey,
            @Value("${groq.api.key:}") String sharedFallback
    ) {
        return GroqKeyPool.fromConfig("valuation", keysCsv, singleKey, sharedFallback);
    }

    @Bean
    @Qualifier("chat")
    public GroqKeyPool chatGroqKeyPool(
            @Value("${groq.chat.api.keys:${groq.api.keys:}}") String keysCsv,
            @Value("${groq.chat.api.key:${groq.api.key:}}") String singleKey,
            @Value("${groq.api.key:}") String sharedFallback
    ) {
        return GroqKeyPool.fromConfig("chat", keysCsv, singleKey, sharedFallback);
    }
}
