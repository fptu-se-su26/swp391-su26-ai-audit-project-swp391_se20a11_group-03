package com.swp391.repository;

import com.swp391.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {
    List<CategoryAttribute> findByCategoryId(Integer categoryId);
    List<CategoryAttribute> findByCategoryIdOrderByDisplayOrderAsc(Integer categoryId);
    List<CategoryAttribute> findByCategoryCategoryId(Integer categoryId);
    List<CategoryAttribute> findByCategoryCategoryIdOrderByDisplayOrderAsc(Integer categoryId);
}
