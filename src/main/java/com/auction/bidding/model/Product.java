package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SellerId", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CategoryId", nullable = false)
    private Category category;

    @Column(name = "ProductName", nullable = false)
    private String productName;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "ImagesUrl", columnDefinition = "NVARCHAR(MAX)")
    private String imagesUrl;

    @Column(name = "Condition")
    private String condition;

    @Column(name = "Brand")
    private String brand;

    @Column(name = "Origin")
    private String origin;

    @Column(name = "WeightSize")
    private String weightSize;

    @Column(name = "StartingPrice", nullable = false)
    private Long startingPrice;

    @Column(name = "StepPrice", nullable = false)
    private Long stepPrice;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "TaxPercent", nullable = false)
    private Integer taxPercent;
}

