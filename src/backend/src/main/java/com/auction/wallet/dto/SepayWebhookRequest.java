package com.auction.wallet.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class SepayWebhookRequest {
    @JsonAlias({"id", "transactionId"})
    private Long id;

    @JsonAlias({"transferAmount", "amount", "Amount"})
    private Long transferAmount;

    @JsonAlias({"content", "description", "transactionContent"})
    private String content;

    @JsonAlias({"referenceCode", "reference_code"})
    private String referenceCode;

    @JsonAlias({"gateway", "bank", "bankBrandName"})
    private String gateway;

    @JsonAlias({"transferType", "transfer_type"})
    private String transferType;

    @JsonAlias({"accountNumber", "account_number"})
    private String accountNumber;
}
