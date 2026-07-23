package com.auction;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * @author Pham Manh Thang
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
public class AuctionApplication {
    public static void main(String[] args) {
        // Pin the JVM default zone so LocalDateTime.now() (used by schedulers and
        // serverNow) is always Vietnam wall-clock, regardless of the host OS zone
        // (production VPS typically runs UTC). Must run before the context starts.
        TimeZone.setDefault(TimeZone.getTimeZone(
                System.getenv().getOrDefault("APP_TIME_ZONE", "Asia/Ho_Chi_Minh")));
        SpringApplication.run(AuctionApplication.class, args);
    }
}


