package com.auction.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "ProductApprovals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ApprovalId")
    private Long approvalId;

    @Column(name = "ProductId", nullable = false)
    private Long productId;

    @Column(name = "ReviewedBy", nullable = false)
    private Long reviewedBy;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "Reason", length = 500)
    private String reason;

    @Column(name = "ApprovalNote", columnDefinition = "NVARCHAR(MAX)")
    private String approvalNote;

    @Column(name = "ReviewedAt", nullable = false)
    private LocalDateTime reviewedAt;
}

