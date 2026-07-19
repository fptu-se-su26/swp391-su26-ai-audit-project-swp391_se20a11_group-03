package com.auction.premium.service;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.premium.entity.AutoBidConfig;
import com.auction.premium.repository.AutoBidConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AutoBidConfigService {
    private final AutoBidConfigRepository repository;
    private final AuctionRepository auctionRepository;
    private final PremiumAccessService premiumAccessService;
    private final AuctionDepositRepository auctionDepositRepository;
    @Transactional
    public AutoBidConfig upsert(Long buyerId, Long auctionId, Long maxPrice, boolean active) {
        premiumAccessService.requirePremium(buyerId);
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + auctionId));
        if (auction.getProduct() != null && buyerId.equals(auction.getProduct().getSellerId()))
            throw new BusinessException("Seller cannot auto-bid on their own product");
        if (maxPrice <= 0) throw new BusinessException("Maximum price must be positive");
        if (active && auctionDepositRepository.findByAuction_AuctionIdAndUser_Id(auctionId, Math.toIntExact(buyerId)).isEmpty())
            throw new BusinessException("A confirmed auction deposit is required before enabling auto-bid");
        AutoBidConfig config = repository.findByBuyerIdAndAuctionId(buyerId, auctionId).orElseGet(AutoBidConfig::new);
        config.setBuyerId(buyerId); config.setAuctionId(auctionId); config.setMaxPrice(maxPrice); config.setActive(active);
        return repository.save(config);
    }
}
