package com.auction.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CccdOcrResult {
    private boolean success;
    private String message;
    private String provider;
    private Double confidenceScore;

    private String fullName;
    private String cccdNumber;
    private String dob;
    private String gender;
    private String issueDate;
    private String issuePlace;
    private String address;

    private Boolean cccdDuplicate;
    private List<CccdDuplicateInfo> cccdDuplicates;
}
