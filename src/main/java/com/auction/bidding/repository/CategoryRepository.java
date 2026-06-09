package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}

