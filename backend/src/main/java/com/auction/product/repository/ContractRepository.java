package com.auction.product.repository;

import com.auction.product.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByContractTypeAndReferenceId(String contractType, Long referenceId);
}

