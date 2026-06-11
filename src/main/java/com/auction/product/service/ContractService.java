package com.auction.product.service;

import com.auction.product.entity.Contract;

/**
 * @author Pham Manh Thang
 */
public interface ContractService {
    Contract createListingContract(Long productId, Long generatedBy);
}

