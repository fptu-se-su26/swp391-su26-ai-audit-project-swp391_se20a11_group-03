package com.auction.product.repository;

import com.auction.product.entity.FeaturedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeaturedProductRepository extends JpaRepository<FeaturedProduct, Long> {

    List<FeaturedProduct> findByPeriodTypeOrderByDisplayOrderAsc(String periodType);

    void deleteByPeriodType(String periodType);
}
