package com.auction.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SealedConfig {
    private LocalDateTime revealAt;
    private String tieBreakRule;
}
