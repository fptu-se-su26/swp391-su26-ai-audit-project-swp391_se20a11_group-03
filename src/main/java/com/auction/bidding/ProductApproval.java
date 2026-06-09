package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ProductApprovals")
@Getter
@Setter
public class ProductApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ApprovalId")
    private Long approvalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewedBy", nullable = false)
    private User reviewedBy;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "Reason")
    private String reason;

    @Column(name = "ReviewedAt", nullable = false)
    private LocalDateTime reviewedAt;
}
