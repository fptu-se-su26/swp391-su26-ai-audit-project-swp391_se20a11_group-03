package com.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "attribute_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributeOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OptionId")
    private Long optionId;

    @Column(name = "AttributeId", nullable = false)
    private Long attributeId;

    @Column(name = "OptionValue", nullable = false, length = 100)
    private String optionValue;
}

