package com.auction.product.controller;

import com.auction.common.dto.ApiResponse;

import com.auction.product.dto.*;
import com.auction.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 * Category REST API Controller (JSON only)
 */
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable("categoryId") Integer categoryId) {
        CategoryDTO category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> searchCategories(@RequestParam String keyword) {
        List<CategoryDTO> categories = categoryService.searchCategories(keyword);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{categoryId}/attributes")
    public ResponseEntity<ApiResponse<List<CategoryAttributeDTO>>> getAttributesByCategory(@PathVariable("categoryId") Integer categoryId) {
        List<CategoryAttributeDTO> attributes = categoryService.getAttributesByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success(attributes));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = categoryService.createCategory(categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    @PostMapping("/attributes")
    public ResponseEntity<ApiResponse<CategoryAttributeDTO>> addCategoryAttribute(@Valid @RequestBody CategoryAttributeDTO dto) {
        CategoryAttributeDTO created = categoryService.addCategoryAttribute(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category attribute added successfully", created));
    }

    @PostMapping("/attributes/options")
    public ResponseEntity<ApiResponse<AttributeOptionDTO>> addAttributeOption(@Valid @RequestBody AttributeOptionDTO dto) {
        AttributeOptionDTO created = categoryService.addAttributeOption(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attribute option added successfully", created));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable("categoryId") Integer categoryId,
            @Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = categoryService.updateCategory(categoryId, categoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("categoryId") Integer categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}

