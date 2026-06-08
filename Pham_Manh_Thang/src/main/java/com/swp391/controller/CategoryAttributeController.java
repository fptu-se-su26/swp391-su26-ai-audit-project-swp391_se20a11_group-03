package com.swp391.controller;

import com.swp391.dto.ApiResponse;
import com.swp391.dto.CategoryAttributeDTO;
import com.swp391.entity.CategoryAttribute;
import com.swp391.repository.CategoryAttributeRepository;
import com.swp391.repository.CategoryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
public class CategoryAttributeController {

    private final CategoryAttributeRepository categoryAttributeRepository;
    private final CategoryRepository categoryRepository;

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<CategoryAttributeDTO>>> getAttributesByCategory(@PathVariable Integer categoryId) {
        List<CategoryAttribute> attributes = categoryAttributeRepository.findByCategoryIdOrderByDisplayOrderAsc(categoryId);
        List<CategoryAttributeDTO> dtos = attributes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryAttributeDTO>> createAttribute(@Valid @RequestBody CategoryAttributeDTO dto) {
        CategoryAttribute attribute = new CategoryAttribute();
        attribute.setCategoryId(dto.getCategoryId());
        attribute.setAttributeName(dto.getAttributeName());
        attribute.setDataType(dto.getDataType());
        attribute.setIsRequired(dto.getIsRequired());
        attribute.setDisplayOrder(dto.getDisplayOrder());
        
        CategoryAttribute saved = categoryAttributeRepository.save(attribute);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attribute created successfully", convertToDTO(saved)));
    }

    @PutMapping("/{attributeId}")
    public ResponseEntity<ApiResponse<CategoryAttributeDTO>> updateAttribute(@PathVariable Long attributeId,
                                                                             @Valid @RequestBody CategoryAttributeDTO dto) {
        CategoryAttribute attribute = categoryAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));
        
        attribute.setAttributeName(dto.getAttributeName());
        attribute.setDataType(dto.getDataType());
        attribute.setIsRequired(dto.getIsRequired());
        attribute.setDisplayOrder(dto.getDisplayOrder());
        
        CategoryAttribute updated = categoryAttributeRepository.save(attribute);
        return ResponseEntity.ok(ApiResponse.success("Attribute updated successfully", convertToDTO(updated)));
    }

    @DeleteMapping("/{attributeId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long attributeId) {
        if (!categoryAttributeRepository.existsById(attributeId)) {
            throw new RuntimeException("Attribute not found");
        }
        categoryAttributeRepository.deleteById(attributeId);
        return ResponseEntity.ok(ApiResponse.success("Attribute deleted successfully", null));
    }

    private CategoryAttributeDTO convertToDTO(CategoryAttribute attribute) {
        return new CategoryAttributeDTO(
                attribute.getAttributeId(),
                attribute.getCategoryId(),
                attribute.getAttributeName(),
                attribute.getDataType(),
                attribute.getIsRequired(),
                attribute.getDisplayOrder()
        );
    }
}
