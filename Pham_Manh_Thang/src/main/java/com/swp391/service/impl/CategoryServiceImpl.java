package com.swp391.service.impl;

import com.swp391.dto.CategoryDTO;
import com.swp391.entity.Category;
import com.swp391.exception.BusinessException;
import com.swp391.exception.ResourceNotFoundException;
import com.swp391.repository.CategoryRepository;
import com.swp391.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            throw new BusinessException("Category name already exists");
        }
        Category category = new Category();
        category.setCategoryName(categoryDTO.getCategoryName());
        category.setDescription(categoryDTO.getDescription());
        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Integer categoryId, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        if (!category.getCategoryName().equals(categoryDTO.getCategoryName()) && 
            categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            throw new BusinessException("Category name already exists");
        }
        
        category.setCategoryName(categoryDTO.getCategoryName());
        category.setDescription(categoryDTO.getDescription());
        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }

    @Override
    public List<CategoryDTO> searchCategories(String keyword) {
        return categoryRepository.searchCategories(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(
                category.getCategoryId(),
                category.getCategoryName(),
                category.getDescription()
        );
    }
}
