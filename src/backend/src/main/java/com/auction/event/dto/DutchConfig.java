package com.auction.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DutchConfig {
    private Integer dropIntervalSeconds;
    private Long dropAmount;
    private Long floorPrice;
}
