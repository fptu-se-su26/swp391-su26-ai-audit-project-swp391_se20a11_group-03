package com.auction.product.repository;

import com.auction.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(String status);
    List<Product> findBySellerId(Long sellerId);
    long countBySellerIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long sellerId, LocalDateTime from, LocalDateTime to);
}

