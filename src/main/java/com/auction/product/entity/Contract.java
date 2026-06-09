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
@Table(name = "Contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ContractId")
    private Long contractId;

    @Column(name = "ContractType", nullable = false, length = 50)
    private String contractType;

    @Column(name = "ReferenceId", nullable = false)
    private Long referenceId;

    @Column(name = "FileUrl", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "Status", nullable = false, length = 30)
    private String status = "GENERATED";

    @Column(name = "GeneratedBy")
    private Long generatedBy;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
