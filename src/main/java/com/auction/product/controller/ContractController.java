package com.auction.product.controller;

import com.auction.common.dto.ApiResponse;

import com.auction.common.dto.ApiResponse;
import com.auction.product.entity.Contract;
import com.auction.product.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 * Temporary controller for UI testing
 */
@RestController
@RequestMapping("/admin/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractRepository contractRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Contract>>> getContracts() {
        List<Contract> contracts = contractRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
}

