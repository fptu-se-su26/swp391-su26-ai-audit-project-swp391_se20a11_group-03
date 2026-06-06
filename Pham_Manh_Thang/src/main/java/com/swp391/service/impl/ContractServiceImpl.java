package com.swp391.service.impl;

import com.swp391.entity.Contract;
import com.swp391.repository.ContractRepository;
import com.swp391.service.ContractService;
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
    public Contract createListingContract(Long productId) {
        Contract contract = new Contract();
        contract.setContractType("LISTING");
        contract.setReferenceId(productId);
        // TODO: Integrate PDF generation service after merge
        contract.setFileUrl(""); // Placeholder for actual PDF file URL
        contract.setCreatedAt(LocalDateTime.now());
        return contractRepository.save(contract);
    }
}
