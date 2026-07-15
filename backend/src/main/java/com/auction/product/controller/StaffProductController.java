package com.auction.product.controller;

import com.auction.product.dto.ProductApprovalRequestDTO;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Controller
@RequestMapping("/staff/products")
@RequiredArgsConstructor
public class StaffProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    @GetMapping("/pending")
    public String getPendingProductsPage(Model model) {
        List<Product> pendingProducts = productRepository.findByStatus("PENDING");
        model.addAttribute("products", pendingProducts);
        return "staff/product-approvals";
    }

    @PostMapping("/{productId}/approve")
    public String approveProduct(
            @PathVariable("productId") Long productId,
            RedirectAttributes redirectAttributes) {
        try {
            // TODO: Replace with actual authenticated user ID from Spring Security
            Long reviewerId = 1L;
            productService.approveProduct(productId, new ProductApprovalRequestDTO(), reviewerId);
            redirectAttributes.addFlashAttribute("message", "Product approved successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error approving product: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/staff/products/pending";
    }

    @PostMapping("/{productId}/reject")
    public String rejectProduct(
            @PathVariable("productId") Long productId,
            @RequestParam("reason") String reason,
            RedirectAttributes redirectAttributes) {
        try {
            // TODO: Replace with actual authenticated user ID from Spring Security
            Long reviewerId = 1L;
            ProductApprovalRequestDTO request = new ProductApprovalRequestDTO();
            request.setReason(reason);
            productService.rejectProduct(productId, request, reviewerId);
            redirectAttributes.addFlashAttribute("message", "Product rejected successfully!");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", "Error rejecting product: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/staff/products/pending";
    }
}

