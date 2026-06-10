package com.auction.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Products")
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProductId")
    private Long productId;

    @Column(name = "SellerId", nullable = false)
    private Long sellerId;

    @Column(name = "CategoryId", nullable = false)
    private Integer categoryId;

    @Column(name = "ProductName", nullable = false, length = 255)
    private String productName;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "StartingPrice", nullable = false)
    private Long startingPrice;

    @Column(name = "StepPrice", nullable = false)
    private Long stepPrice = 1000000L;

    @Column(name = "TaxPercent", nullable = false)
    private Integer taxPercent = 5;

    @Column(name = "Status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "SubmittedAt", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "RejectionReason", length = 500)
    private String rejectionReason;
}
