package com.vnec.servlet;

import com.vnec.service.FptAiService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

public class FptAiHealthServlet extends HttpServlet {
    private final FptAiService fptAiService = new FptAiService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        FptAiService.FptAiResult result = fptAiService.healthCheck();

        try (PrintWriter out = response.getWriter()) {
            out.print("{");
            out.print("\"success\":" + result.success() + ",");
            out.print("\"missingKey\":" + result.missingKey() + ",");
            out.print("\"message\":\"" + escapeJson(result.message()) + "\",");
            out.print("\"payload\":\"" + escapeJson(result.payload()) + "\"");
            out.print("}");
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
