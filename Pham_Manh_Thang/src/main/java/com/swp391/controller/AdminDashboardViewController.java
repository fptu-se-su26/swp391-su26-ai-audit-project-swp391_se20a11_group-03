package com.swp391.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Admin dashboard page mapping for revenue analytics and export tools.
 */
@Controller
public class AdminDashboardViewController {

    @GetMapping("/admin/dashboard")
    public String redirectLegacyDashboard() {
        return "redirect:/admin/revenue";
    }

    @GetMapping("/admin/dashboard/revenue")
    public String redirectLegacyRevenue() {
        return "redirect:/admin/revenue";
    }

    @GetMapping("/admin/dashboard/reports")
    public String redirectLegacyReports() {
        return "redirect:/admin/reports";
    }

    @GetMapping("/admin/revenue")
    public String getRevenuePage() {
        return "admin/revenue-analytics";
    }

    @GetMapping("/admin/reports")
    public String getReportsPage() {
        return "admin/data-reports";
    }
}
