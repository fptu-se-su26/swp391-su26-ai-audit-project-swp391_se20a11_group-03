package com.auction.bidding.service.impl;

import com.auction.bidding.dto.AuctionPaymentResponse;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionPaymentService;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuctionPaymentServiceImpl implements AuctionPaymentService {

    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public AuctionPaymentResponse payAuction(Long auctionId, Long userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getEndTime() == null || auction.getEndTime().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Auction has not ended yet");
        }
        if (auction.getCurrentWinnerUser() == null || auction.getCurrentWinnerUser().getId() != userId.intValue()) {
            throw new IllegalStateException("Only the winning bidder can pay for this auction");
        }
        if ("PAID".equalsIgnoreCase(auction.getPaymentStatus()) || "PAID".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalStateException("Auction is already paid");
        }
        if ("FORFEITED".equalsIgnoreCase(auction.getPaymentStatus()) || "FORFEITED".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalStateException("Payment window has expired for this auction");
        }

        Wallet buyerWallet = walletRepository.findByUser_Id(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        AuctionDeposit deposit = auctionDepositRepository
                .findByAuction_AuctionIdAndUser_Id(auctionId, Math.toIntExact(userId))
                .orElse(null);

        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;
        long depositAmount = deposit != null && deposit.getDepositAmount() != null ? deposit.getDepositAmount() : 0L;
        long amountToCharge = Math.max(0L, finalPrice - depositAmount);
        long currentBalance = buyerWallet.getBalance() != null ? buyerWallet.getBalance() : 0L;
        long currentHold = buyerWallet.getHoldBalance() != null ? buyerWallet.getHoldBalance() : 0L;

        if (currentBalance < amountToCharge) {
            throw new IllegalStateException("Insufficient wallet balance to complete auction payment");
        }

        LocalDateTime now = LocalDateTime.now();
        buyerWallet.setBalance(currentBalance - amountToCharge);
        buyerWallet.setHoldBalance(Math.max(0L, currentHold - depositAmount));
        buyerWallet.setUpdatedAt(now);
        walletRepository.save(buyerWallet);

        if (amountToCharge > 0) {
            transactionRepository.save(new Transaction(
                    buyerWallet,
                    amountToCharge,
                    "AUCTION_PAYMENT",
                    "COMPLETED",
                    "AUC-PAY-" + auctionId,
                    "Final payment for auction " + auctionId,
                    now
            ));
        }

        if (deposit != null) {
            deposit.setStatus("APPLIED_TO_PAYMENT");
            deposit.setSettlementType("APPLIED_TO_PAYMENT");
            deposit.setSettledAt(now);
            auctionDepositRepository.save(deposit);
        }

        Wallet sellerWallet = null;
        if (auction.getProduct() != null && auction.getProduct().getSellerId() != null) {
            sellerWallet = walletRepository.findByUser_Id(Math.toIntExact(auction.getProduct().getSellerId())).orElse(null);
        }
        if (sellerWallet != null) {
            long sellerBalance = sellerWallet.getBalance() != null ? sellerWallet.getBalance() : 0L;
            sellerWallet.setBalance(sellerBalance + finalPrice);
            sellerWallet.setUpdatedAt(now);
            walletRepository.save(sellerWallet);
            transactionRepository.save(new Transaction(
                    sellerWallet,
                    finalPrice,
                    "AUCTION_PAYOUT",
                    "COMPLETED",
                    "AUC-PAYOUT-" + auctionId,
                    "Payout for auction " + auctionId,
                    now
            ));
        }

        auction.setStatus("PAID");
        auction.setPaymentStatus("PAID");
        auction.setSettledAt(now);
        auctionRepository.save(auction);

        return AuctionPaymentResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .finalPrice(finalPrice)
                .depositApplied(depositAmount)
                .amountCharged(amountToCharge)
                .walletBalance(buyerWallet.getBalance())
                .walletHoldBalance(buyerWallet.getHoldBalance())
                .paymentStatus(auction.getPaymentStatus())
                .message("Auction payment completed successfully")
                .build();
    }
}
