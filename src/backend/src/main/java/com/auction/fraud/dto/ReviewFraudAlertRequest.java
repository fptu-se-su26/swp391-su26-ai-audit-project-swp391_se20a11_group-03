package com.auction.fraud.dto;

import jakarta.validation.constraints.Size;

public record ReviewFraudAlertRequest(@Size(max = 1000) String note) {
}
