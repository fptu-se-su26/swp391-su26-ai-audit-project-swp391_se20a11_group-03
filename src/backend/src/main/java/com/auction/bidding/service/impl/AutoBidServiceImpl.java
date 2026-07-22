package com.auction.bidding.service.impl;

import com.auction.bidding.dto.AutoBidResponse;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.entity.AutoBid;
import com.auction.bidding.entity.AutoBidStatus;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.AutoBidRepository;
import com.auction.bidding.service.AutoBidService;
import com.auction.bidding.util.StepCalculator;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.premium.service.PremiumPurchaseService;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AutoBidServiceImpl implements AutoBidService {

    private final AutoBidRepository autoBidRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final ProductRepository productRepository;
    private final PremiumPurchaseService premiumPurchaseService;

    @Override
    @Transactional
    public AutoBidResponse setAutoBid(Long auctionId, Long userId, Long maxBidAmount) {
        if (!premiumPurchaseService.isPremiumActive(userId)) {
            throw new BusinessException("Chỉ tài khoản Premium mới có thể sử dụng đấu giá tự động");
        }

        AuctionSession auction = auctionSessionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiên đấu giá không tồn tại"));
        if (auction.getStatus() != AuctionStatus.ACTIVE && auction.getStatus() != AuctionStatus.UPCOMING) {
            throw new BusinessException("Phiên đấu giá đã kết thúc, không thể đặt giá tự động");
        }
        if (auction.getAuctionMode() != AuctionMode.TIMED) {
            throw new BusinessException("Đấu giá tự động chỉ áp dụng cho phiên đấu giá dài hạn (TIMED)");
        }

        long minRequired = computeMinNextBid(auction);
        if (maxBidAmount == null || maxBidAmount < minRequired) {
            throw new BusinessException("Mức tối đa phải từ " + String.format("%,d", minRequired) + " VND trở lên");
        }

        LocalDateTime now = LocalDateTime.now();
        AutoBid autoBid = autoBidRepository.findByAuctionIdAndUserId(auctionId, userId).orElse(null);
        if (autoBid == null) {
            autoBid = new AutoBid();
            autoBid.setAuctionId(auctionId);
            autoBid.setUserId(userId);
            autoBid.setCreatedAt(now);
        }
        autoBid.setMaxBidAmount(maxBidAmount);
        autoBid.setStatus(AutoBidStatus.ACTIVE);
        autoBid.setUpdatedAt(now);
        autoBid = autoBidRepository.save(autoBid);

        return toResponse(autoBid, "Đã bật đấu giá tự động");
    }

    @Override
    @Transactional
    public AutoBidResponse cancelAutoBid(Long auctionId, Long userId) {
        AutoBid autoBid = autoBidRepository.findByAuctionIdAndUserId(auctionId, userId).orElse(null);
        if (autoBid == null) {
            return new AutoBidResponse(auctionId, null, null, "Không có đấu giá tự động nào đang bật");
        }
        autoBid.setStatus(AutoBidStatus.CANCELLED);
        autoBid.setUpdatedAt(LocalDateTime.now());
        autoBid = autoBidRepository.save(autoBid);
        return toResponse(autoBid, "Đã tắt đấu giá tự động");
    }

    @Override
    @Transactional(readOnly = true)
    public AutoBidResponse getMyAutoBid(Long auctionId, Long userId) {
        return autoBidRepository.findByAuctionIdAndUserId(auctionId, userId)
                .map(autoBid -> toResponse(autoBid, null))
                .orElse(null);
    }

    /** Mirrors the min-next-bid rule BiddingService.placeBid enforces, for both auction modes. */
    private long computeMinNextBid(AuctionSession auction) {
        Product product = productRepository.findById(auction.getProductId()).orElse(null);
        long startingPrice = product != null && product.getStartingPrice() != null ? product.getStartingPrice() : 0L;
        long current = auction.getCurrentHighestBid() == null ? 0L : auction.getCurrentHighestBid();
        boolean hasPriorBids = auction.getCurrentWinnerUserId() != null;
        if (auction.getAuctionMode() == AuctionMode.TIMED) {
            return StepCalculator.computeTimedMinNextBid(startingPrice, current, hasPriorBids);
        }
        long step = StepCalculator.calculate(startingPrice);
        return StepCalculator.computeMinNextBid(startingPrice, current, step);
    }

    private AutoBidResponse toResponse(AutoBid autoBid, String message) {
        return new AutoBidResponse(
                autoBid.getAuctionId(),
                autoBid.getMaxBidAmount(),
                autoBid.getStatus().name(),
                message
        );
    }
}
