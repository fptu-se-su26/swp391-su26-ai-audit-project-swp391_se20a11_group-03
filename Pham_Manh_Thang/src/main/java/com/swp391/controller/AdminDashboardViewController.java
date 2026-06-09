package com.swp391.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Admin dashboard page mapping for revenue analytics and export tools.
 */
@Controller
@RequestMapping("/admin/dashboard")
public class AdminDashboardViewController {

    @GetMapping
    public String getDashboardPage() {
        return "redirect:/admin/dashboard/revenue";
    }

    @GetMapping("/revenue")
    public String getRevenuePage() {
        return "admin/revenue-analytics";
    }

    @GetMapping("/reports")
    public String getReportsPage() {
        return "admin/data-reports";
    }
}
