package com.swp391.controller;

import com.swp391.dto.CategoryDTO;
import com.swp391.entity.Category;
import com.swp391.entity.CategoryAttribute;
import com.swp391.repository.CategoryRepository;
import com.swp391.repository.CategoryAttributeRepository;
import com.swp391.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * @author Pham Manh Thang
 */
@Controller
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;

    @GetMapping
    public String getCategoryManagementPage(Model model, @RequestParam(value = "selectedId", required = false) Integer selectedId) {
        List<Category> categories = categoryRepository.findAll();
        model.addAttribute("categories", categories);
        Category selectedCategory = null;
        List<CategoryAttribute> attributes = null;
        if (selectedId != null) {
            Optional<Category> optionalSelectedCategory = categoryRepository.findById(selectedId);
            selectedCategory = optionalSelectedCategory.orElse(null);
            if (selectedCategory != null) {
                attributes = categoryAttributeRepository.findByCategoryIdOrderByDisplayOrderAsc(selectedId);
            }
        }
        model.addAttribute("selectedCategory", selectedCategory);
        model.addAttribute("attributes", attributes);
        return "admin/category-management";
    }

    @PostMapping
    public String saveCategory(@ModelAttribute CategoryDTO categoryDTO, RedirectAttributes redirectAttributes) {
        try {
            if (categoryDTO.getIsActive() == null) {
                categoryDTO.setIsActive(true);
            }
            if (categoryDTO.getCategoryId() != null) {
                // Update existing category
                categoryService.updateCategory(categoryDTO.getCategoryId(), categoryDTO);
                redirectAttributes.addFlashAttribute("message", "Category updated successfully!");
            } else {
                // Create new category
                categoryService.createCategory(categoryDTO);
                redirectAttributes.addFlashAttribute("message", "Category created successfully!");
            }
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error saving category: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/categories";
    }

    @PostMapping("/{categoryId}/delete")
    public String deleteCategory(@PathVariable Integer categoryId, RedirectAttributes redirectAttributes) {
        try {
            categoryService.deleteCategory(categoryId);
            redirectAttributes.addFlashAttribute("message", "Category deleted successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error deleting category: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/categories";
    }
}
