package com.auction.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "FeaturedProducts")
@Getter
@Setter
public class FeaturedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FeaturedId")
    private Long featuredId;

    @Column(name = "PeriodType", nullable = false, length = 10)
    private String periodType;

    @Column(name = "ProductId", nullable = false)
    private Long productId;

    @Column(name = "DisplayOrder", nullable = false)
    private Integer displayOrder;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "UpdatedBy")
    private Long updatedBy;
}
