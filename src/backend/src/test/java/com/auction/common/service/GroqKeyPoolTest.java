package com.auction.common.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GroqKeyPoolTest {

    @Test
    void rotatesKeysRoundRobin() {
        GroqKeyPool pool = GroqKeyPool.fromConfig("test", "key-a,key-b");

        assertEquals("key-a", pool.executeWithPool(key -> key));
        assertEquals("key-b", pool.executeWithPool(key -> key));
        assertEquals("key-a", pool.executeWithPool(key -> key));
    }

    @Test
    void failsOverWhenFirstKeyIsRejected() {
        GroqKeyPool pool = GroqKeyPool.fromConfig("test", "rejected-key,working-key");

        String result = pool.executeWithPool(key -> {
            if ("rejected-key".equals(key)) {
                throw HttpClientErrorException.create(
                        HttpStatus.FORBIDDEN,
                        "Forbidden",
                        HttpHeaders.EMPTY,
                        new byte[0],
                        StandardCharsets.UTF_8
                );
            }
            return key;
        });

        assertEquals("working-key", result);
    }
}
