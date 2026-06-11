package com.auction.product.repository;

import com.auction.product.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByProductId(Long productId);
}

