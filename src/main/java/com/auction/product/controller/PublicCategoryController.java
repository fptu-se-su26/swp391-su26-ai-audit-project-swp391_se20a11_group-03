package com.auction.product.controller;

import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.CategoryAttributeDTO;
import com.auction.product.dto.CategoryDTO;
import com.auction.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories().stream()
                .filter(category -> Boolean.TRUE.equals(category.getIsActive()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{categoryId}/attributes")
    public ResponseEntity<ApiResponse<List<CategoryAttributeDTO>>> getCategoryAttributes(
            @PathVariable Integer categoryId) {
        List<CategoryAttributeDTO> attributes = categoryService.getAttributesByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success(attributes));
    }
}
