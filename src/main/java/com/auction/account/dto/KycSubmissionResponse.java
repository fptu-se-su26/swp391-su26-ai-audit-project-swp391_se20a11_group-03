package com.auction.account.dto;

import com.auction.common.service.ImageForensicsService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycSubmissionResponse {
    private Long kycId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String cccdNumber;
    private LocalDate dob;
    private String gender;
    private LocalDate issueDate;
    private String issuePlace;
    private String frontImageUrl;
    private String backImageUrl;
    private String selfieImageUrl;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime processedAt;
    private String processedByName;
    private String rejectionReason;
    private ImageAnalysis frontImageAnalysis;
    private ImageAnalysis backImageAnalysis;
    private ImageAnalysis selfieImageAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageAnalysis {
        private Integer riskScore;
        private String severity;
        private List<ImageForensicsService.Signal> signals;
    }
}
