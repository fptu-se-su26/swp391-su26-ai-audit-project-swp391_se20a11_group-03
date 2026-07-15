package com.auction.product.service;

import com.auction.product.dto.*;
import java.util.List;

/**
 * @author Pham Manh Thang
 */
public interface CategoryService {
    List<CategoryDTO> getAllCategories();
    CategoryDTO getCategoryById(Integer categoryId);
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    CategoryDTO updateCategory(Integer categoryId, CategoryDTO categoryDTO);
    void deleteCategory(Integer categoryId);
    List<CategoryDTO> searchCategories(String keyword);

    CategoryAttributeDTO addCategoryAttribute(CategoryAttributeDTO dto);
    AttributeOptionDTO addAttributeOption(AttributeOptionDTO dto);
    List<CategoryAttributeDTO> getAttributesByCategoryId(Integer categoryId);
}

