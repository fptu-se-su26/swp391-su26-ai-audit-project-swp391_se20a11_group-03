package com.auction.product.controller;

import com.auction.product.dto.CategoryDTO;
import com.auction.product.entity.Category;
import com.auction.product.repository.CategoryRepository;
import com.auction.product.service.CategoryService;
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

    @GetMapping
    public String getCategoryManagementPage(Model model, @RequestParam(value = "selectedId", required = false) Integer selectedId) {
        List<Category> categories = categoryRepository.findAll();
        model.addAttribute("categories", categories);
        Category selectedCategory = null;
        if (selectedId != null) {
            Optional<Category> optionalSelectedCategory = categoryRepository.findById(selectedId);
            selectedCategory = optionalSelectedCategory.orElse(null);
        }
        model.addAttribute("selectedCategory", selectedCategory);
        return "admin/category-management";
    }

    @PostMapping
    public String createCategory(@ModelAttribute CategoryDTO categoryDTO, RedirectAttributes redirectAttributes) {
        try {
            if (categoryDTO.getIsActive() == null) {
                categoryDTO.setIsActive(true);
            }
            categoryService.createCategory(categoryDTO);
            redirectAttributes.addFlashAttribute("message", "Category created successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error creating category: " + e.getMessage());
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

