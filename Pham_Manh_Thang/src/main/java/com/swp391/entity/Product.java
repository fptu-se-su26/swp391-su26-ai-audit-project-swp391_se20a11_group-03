package com.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "Products")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "ProductName", nullable = false, length = 255)
    private String productName;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "ImagesUrl", columnDefinition = "NVARCHAR(MAX)")
    private String imagesUrl;

    @Column(name = "Condition", length = 50)
    private String condition;

    @Column(name = "Brand", length = 100)
    private String brand;

    @Column(name = "Origin", length = 100)
    private String origin;

    @Column(name = "WeightSize", length = 100)
    private String weightSize;

    @Column(name = "StartingPrice", nullable = false)
    private Long startingPrice;

    @Column(name = "StepPrice", nullable = false)
    private Long stepPrice = 1000000L;

    @Column(name = "Status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "TaxPercent", nullable = false)
    private Integer taxPercent = 5;
}
