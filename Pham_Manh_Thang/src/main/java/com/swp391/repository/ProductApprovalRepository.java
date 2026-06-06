package com.swp391.repository;

import com.swp391.entity.ProductApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface ProductApprovalRepository extends JpaRepository<ProductApproval, Long> {
    List<ProductApproval> findByProduct_ProductId(Long productId);
}
