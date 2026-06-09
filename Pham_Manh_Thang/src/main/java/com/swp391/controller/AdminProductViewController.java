package com.swp391.controller;

import com.swp391.dto.ProductApprovalRequestDTO;
import com.swp391.entity.Category;
import com.swp391.entity.Product;
import com.swp391.entity.User;
import com.swp391.repository.CategoryRepository;
import com.swp391.repository.ProductRepository;
import com.swp391.repository.UserRepository;
import com.swp391.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Controller
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class AdminProductViewController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @GetMapping("/pending")
    public String getPendingProductsPage(
            @RequestParam(defaultValue = "0") int page,
            Model model) {
        int pageSize = 10;
        Page<Product> pendingProducts = productRepository.findByStatus(
                "PENDING",
                PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "submittedAt"))
        );
        List<Category> categories = categoryRepository.findAll();
        Map<Integer, String> categoryNames = categories.stream()
                .collect(Collectors.toMap(Category::getCategoryId, Category::getCategoryName));
        model.addAttribute("products", pendingProducts.getContent());
        model.addAttribute("categoryNames", categoryNames);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", pendingProducts.getTotalPages());
        model.addAttribute("pageSize", pageSize);
        model.addAttribute("totalItems", pendingProducts.getTotalElements());
        return "admin/product-approvals";
    }

    @PostMapping("/{productId}/approve")
    public String approveProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            RedirectAttributes redirectAttributes) {
        try {
            // Get first admin user as reviewer
            List<User> admins = userRepository.findByRole_RoleName("Admin");
            Long reviewerId = admins.isEmpty() ? 1L : admins.get(0).getUserId();
            productService.approveProduct(productId, new ProductApprovalRequestDTO(), reviewerId);
            redirectAttributes.addFlashAttribute("message", "Product approved successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error approving product: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/products/pending?page=" + page;
    }

    @PostMapping("/{productId}/reject")
    public String rejectProduct(
            @PathVariable Long productId,
            @RequestParam("reason") String reason,
            @RequestParam(defaultValue = "0") int page,
            RedirectAttributes redirectAttributes) {
        try {
            // Get first admin user as reviewer
            List<User> admins = userRepository.findByRole_RoleName("Admin");
            Long reviewerId = admins.isEmpty() ? 1L : admins.get(0).getUserId();
            ProductApprovalRequestDTO request = new ProductApprovalRequestDTO();
            request.setReason(reason);
            productService.rejectProduct(productId, request, reviewerId);
            redirectAttributes.addFlashAttribute("message", "Product rejected successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error rejecting product: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/products/pending?page=" + page;
    }
}
