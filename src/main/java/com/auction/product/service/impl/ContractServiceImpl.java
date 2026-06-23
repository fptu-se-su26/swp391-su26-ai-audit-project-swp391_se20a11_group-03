package com.auction.product.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.product.entity.Contract;
import com.auction.common.exception.BusinessException;
import com.auction.product.repository.ContractRepository;
import com.auction.product.service.ContractService;
import com.auction.product.service.SellerContractPdfService;
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

    public static final String TYPE_SELLER = "SELLER_AGREEMENT";

    private final ContractRepository contractRepository;
    private final SellerContractPdfService pdfService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Contract signSellerContract(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId)).orElse(null);
        String fullName = user != null ? user.getFullName() : null;
        String email = user != null ? user.getEmail() : null;

        // Idempotent: a user only signs the seller agreement once.
        Contract existing = contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).orElse(null);
        if (existing != null) {
            // Ensure a real PDF exists (older rows may point at a placeholder .txt).
            if (existing.getFileUrl() == null || !existing.getFileUrl().endsWith(".pdf")) {
                String fileUrl = pdfService.generateAndStore(userId, fullName, email, existing.getCreatedAt());
                existing.setFileUrl(fileUrl);
                existing = contractRepository.save(existing);
            }
            return existing;
        }

        LocalDateTime now = LocalDateTime.now();
        String fileUrl = pdfService.generateAndStore(userId, fullName, email, now);
        Contract contract = new Contract();
        contract.setContractType(TYPE_SELLER);
        contract.setReferenceId(userId);
        contract.setFileUrl(fileUrl);
        contract.setCreatedAt(now);
        return contractRepository.save(contract);
    }

    @Override
    public Contract getSellerContract(Long userId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).orElse(null);
    }

    @Override
    public boolean hasSellerContract(Long userId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).isPresent();
    }

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

