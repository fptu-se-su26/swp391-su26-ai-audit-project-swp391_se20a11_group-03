package com.swp391.service.impl;

import com.lowagie.text.DocumentException;
import com.swp391.entity.Contract;
import com.swp391.entity.Product;
import com.swp391.entity.User;
import com.swp391.exception.BusinessException;
import com.swp391.exception.ResourceNotFoundException;
import com.swp391.repository.ContractRepository;
import com.swp391.repository.ProductRepository;
import com.swp391.repository.UserRepository;
import com.swp391.service.ContractService;
import com.swp391.util.ThymeleafPDFUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ThymeleafPDFUtil thymeleafPDFUtil;

    @Override
    @Transactional
    public Contract createListingContract(Long productId, Long generatedBy) {
        // Check for existing contract to prevent duplicates
        if (contractRepository.findByContractTypeAndReferenceId("LISTING", productId).isPresent()) {
            throw new BusinessException("Listing contract already exists for product ID: " + productId);
        }

        Contract contract = new Contract();
        contract.setContractType("LISTING");
        contract.setReferenceId(productId);
        contract.setFileUrl("/contracts/listing_" + productId + ".pdf");
        contract.setStatus("GENERATED");
        contract.setGeneratedBy(generatedBy);
        contract.setCreatedAt(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    @Override
    public byte[] generateListingContractPdf(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        User seller = userRepository.findById(product.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + product.getSellerId()));

        Map<String, Object> data = new HashMap<>();
        data.put("contractDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        data.put("sellerName", seller.getUsername() != null ? seller.getUsername() : "N/A");
        data.put("sellerEmail", seller.getEmail() != null ? seller.getEmail() : "N/A");
        data.put("productId", product.getProductId());
        data.put("productName", product.getProductName());
        data.put("productDescription", product.getDescription() != null ? product.getDescription() : "N/A");
        data.put("productStartingPrice", product.getStartingPrice());
        data.put("productStepPrice", product.getStepPrice());
        data.put("productTaxPercent", product.getTaxPercent());

        try {
            return thymeleafPDFUtil.generatePdf("listing-contract", data);
        } catch (DocumentException e) {
            throw new BusinessException("Failed to generate PDF: " + e.getMessage());
        }
    }
}
