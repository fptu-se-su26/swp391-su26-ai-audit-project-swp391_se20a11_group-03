package com.swp391.service;

import com.swp391.dto.*;
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
}
