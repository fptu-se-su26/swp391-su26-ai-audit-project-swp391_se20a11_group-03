package com.swp391.service.impl;

import com.swp391.dto.*;
import com.swp391.entity.*;
import com.swp391.exception.BusinessException;
import com.swp391.exception.ResourceNotFoundException;
import com.swp391.repository.*;
import com.swp391.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final AttributeOptionRepository attributeOptionRepository;

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
        category.setIsActive(true);
        category.setCreatedAt(LocalDateTime.now());
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
        if (categoryDTO.getIsActive() != null) {
            category.setIsActive(categoryDTO.getIsActive());
        }
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

    @Override
    @Transactional
    public CategoryAttributeDTO addCategoryAttribute(CategoryAttributeDTO dto) {
        if (!categoryRepository.existsById(dto.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId());
        }
        CategoryAttribute attribute = new CategoryAttribute();
        attribute.setCategoryId(dto.getCategoryId());
        attribute.setAttributeName(dto.getAttributeName());
        attribute.setDataType(dto.getDataType());
        attribute.setIsRequired(dto.getIsRequired() != null ? dto.getIsRequired() : false);
        attribute.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        attribute = categoryAttributeRepository.save(attribute);
        return convertToAttributeDTO(attribute);
    }

    @Override
    @Transactional
    public AttributeOptionDTO addAttributeOption(AttributeOptionDTO dto) {
        if (!categoryAttributeRepository.existsById(dto.getAttributeId())) {
            throw new ResourceNotFoundException("Category attribute not found with id: " + dto.getAttributeId());
        }
        AttributeOption option = new AttributeOption();
        option.setAttributeId(dto.getAttributeId());
        option.setOptionValue(dto.getOptionValue());
        option = attributeOptionRepository.save(option);
        return convertToOptionDTO(option);
    }

    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(
                category.getCategoryId(),
                category.getCategoryName(),
                category.getDescription(),
                category.getIsActive()
        );
    }

    private CategoryAttributeDTO convertToAttributeDTO(CategoryAttribute attribute) {
        return new CategoryAttributeDTO(
                attribute.getAttributeId(),
                attribute.getCategoryId(),
                attribute.getAttributeName(),
                attribute.getDataType(),
                attribute.getIsRequired(),
                attribute.getDisplayOrder()
        );
    }

    private AttributeOptionDTO convertToOptionDTO(AttributeOption option) {
        return new AttributeOptionDTO(
                option.getOptionId(),
                option.getAttributeId(),
                option.getOptionValue()
        );
    }
}
