package com.auction.product.service;

import com.auction.product.entity.Contract;

/**
 * @author Pham Manh Thang
 */
public interface ContractService {
    Contract createListingContract(Long productId, Long generatedBy);

    /** Records a seller signing the platform seller agreement (idempotent per user). */
    Contract signSellerContract(Long userId);

    /** Returns the signed seller agreement for the user, or null if not signed yet. */
    Contract getSellerContract(Long userId);

    boolean hasSellerContract(Long userId);

    /** Buyer signs the purchase agreement before paying for a won auction. */
    Contract signPurchaseContract(Long auctionId, Long buyerUserId);

    Contract getPurchaseContract(Long auctionId);

    boolean hasPurchaseContract(Long auctionId);
}

