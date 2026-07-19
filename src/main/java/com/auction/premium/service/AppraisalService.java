package com.auction.premium.service;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.premium.entity.*;
import com.auction.premium.repository.AppraisalRequestRepository;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class AppraisalService {
    private final AppraisalRequestRepository repository;
    private final ProductRepository productRepository;
    private final PremiumAccessService premiumAccessService;

    @Transactional
    public AppraisalRequest create(Long sellerId, Long productId) {
        premiumAccessService.requirePremium(sellerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        if (!sellerId.equals(product.getSellerId())) throw new org.springframework.security.access.AccessDeniedException("Seller does not own this product");
        // Edge cases: product ownership mismatch and duplicate pending requests are rejected.
        if (repository.existsBySellerIdAndProductIdAndStatus(sellerId, productId, AppraisalStatus.PENDING))
            throw new BusinessException("A pending appraisal request already exists");
        AppraisalRequest request = new AppraisalRequest();
        request.setSellerId(sellerId); request.setProductId(productId);
        request.setRequestDate(LocalDateTime.now()); request.setStatus(AppraisalStatus.PENDING);
        return repository.save(request);
    }

    @Transactional
    public AppraisalRequest appraise(Long requestId, Long price, String note) {
        AppraisalRequest request = repository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal request not found: " + requestId));
        if (request.getStatus() != AppraisalStatus.PENDING) throw new BusinessException("Appraisal request is already finalized");
        request.setRecommendedPrice(price); request.setExpertNote(note); request.setStatus(AppraisalStatus.APPRAISED);
        return repository.save(request);
    }
}
