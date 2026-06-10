package com.auction.account.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "KycProfiles")
@Getter
@Setter
public class KycProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "KycId")
    private Long kycId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false, unique = true)
    private User user;

    @Column(name = "Phone", nullable = false)
    private String phone;

    @Column(name = "CccdNumber", nullable = false, unique = true)
    private String cccdNumber;

    @Column(name = "FullName", nullable = false)
    private String fullName;

    @Column(name = "Dob", nullable = false)
    private LocalDate dob;

    @Column(name = "Gender", nullable = false)
    private String gender;

    @Column(name = "IssueDate", nullable = false)
    private LocalDate issueDate;

    @Column(name = "IssuePlace", nullable = false)
    private String issuePlace;

    @Column(name = "FrontImageUrl", nullable = false)
    private String frontImageUrl;

    @Column(name = "BackImageUrl", nullable = false)
    private String backImageUrl;

    @Column(name = "SelfieImageUrl", nullable = false)
    private String selfieImageUrl;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "SubmittedAt", nullable = false)
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProcessedBy")
    private User processedBy;

    @Column(name = "ProcessedAt")
    private LocalDateTime processedAt;
}
