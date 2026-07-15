package com.auction.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "ProductAttributeValues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ValueId")
    private Long valueId;

    @Column(name = "ProductId", nullable = false)
    private Long productId;

    @Column(name = "AttributeId", nullable = false)
    private Long attributeId;

    @Column(name = "AttributeValue", nullable = false, length = 500)
    private String attributeValue;
}

