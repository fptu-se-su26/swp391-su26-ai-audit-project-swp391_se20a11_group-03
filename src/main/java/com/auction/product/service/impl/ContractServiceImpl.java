package com.auction.product.service.impl;

import com.auction.product.entity.Contract;
import com.auction.common.exception.BusinessException;
import com.auction.product.repository.ContractRepository;
import com.auction.product.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;

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
        // TODO: Replace with actual PDF generation service
        contract.setFileUrl("/contracts/listing_" + productId + ".pdf");
        contract.setCreatedAt(LocalDateTime.now());
        return contractRepository.save(contract);
    }
}

