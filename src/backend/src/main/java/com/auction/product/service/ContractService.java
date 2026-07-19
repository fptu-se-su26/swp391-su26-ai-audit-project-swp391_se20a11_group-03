package com.auction.product.service;

import com.auction.product.dto.PurchaseContractPreviewDTO;
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

    /** Records buyer acknowledgment of the purchase agreement (in-memory until payment). */
    void acknowledgePurchaseContract(Long auctionId, Long buyerUserId);

    boolean hasPurchaseContractAcknowledgment(Long auctionId, Long buyerUserId);

    /** Persists the purchase agreement PDF and contract row (called on successful payment). */
    Contract signPurchaseContract(Long auctionId, Long buyerUserId);

    Contract getPurchaseContract(Long auctionId);

    PurchaseContractPreviewDTO getPurchaseContractPreview(Long auctionId, Long buyerUserId);

    boolean hasPurchaseContract(Long auctionId);

    boolean hasListingContract(Long productId);

    /** Remove purchase agreement when an auction is forfeited (relist flow). */
    void deletePurchaseContract(Long auctionId);
}

