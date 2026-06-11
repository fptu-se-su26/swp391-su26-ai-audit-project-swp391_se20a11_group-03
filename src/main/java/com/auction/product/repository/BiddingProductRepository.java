package com.auction.product.repository;

import com.auction.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BiddingProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
}

