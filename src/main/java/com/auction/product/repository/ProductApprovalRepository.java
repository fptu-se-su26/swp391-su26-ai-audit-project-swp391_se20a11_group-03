package com.auction.product.repository;

import com.auction.product.entity.ProductApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface ProductApprovalRepository extends JpaRepository<ProductApproval, Long> {
    List<ProductApproval> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}

