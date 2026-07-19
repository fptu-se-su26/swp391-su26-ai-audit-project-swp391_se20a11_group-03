package com.auction.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PennyConfig {
    private Long bidStep;
    private Integer timerResetSeconds;
    private Boolean maxConsecutiveBidsPerUser;
}
