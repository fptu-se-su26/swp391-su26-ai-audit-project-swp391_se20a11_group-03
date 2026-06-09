package com.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "CategoryAttributes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AttributeId")
    private Long attributeId;

    @Column(name = "CategoryId", nullable = false)
    private Integer categoryId;

    @Column(name = "AttributeName", nullable = false, length = 100)
    private String attributeName;

    @Column(name = "DataType", nullable = false, length = 50)
    private String dataType;

    @Column(name = "IsRequired", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "DisplayOrder", nullable = false)
    private Integer displayOrder = 0;
}

