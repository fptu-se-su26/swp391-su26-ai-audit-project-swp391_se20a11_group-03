package com.auction.bidding.service.impl;

import com.auction.bidding.dto.AuctionPaymentResponse;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.account.service.UserPaymentStrikeService;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.service.AuctionPaymentService;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.service.ContractService;
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

    /** Platform commission rate taken from the final price on a paid auction. */
    public static final double PLATFORM_COMMISSION_RATE = 0.20d;

    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ContractService contractService;
    private final UserPaymentStrikeService userPaymentStrikeService;

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
        if (!contractService.hasPurchaseContract(auctionId)) {
            if (!contractService.hasPurchaseContractAcknowledgment(auctionId, userId)) {
                throw new IllegalStateException(
                        "Bạn cần ký hợp đồng mua bán điện tử trước khi hoàn tất thanh toán.");
            }
            contractService.signPurchaseContract(auctionId, userId);
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
        long remainingDueAfterDeposit = Math.max(0L, finalPrice - depositAmount);
        long currentBalance = buyerWallet.getBalance() != null ? buyerWallet.getBalance() : 0L;
        long currentHold = buyerWallet.getHoldBalance() != null ? buyerWallet.getHoldBalance() : 0L;

        if (currentBalance < finalPrice) {
            throw new IllegalStateException("Insufficient wallet balance to complete auction payment");
        }

        LocalDateTime now = LocalDateTime.now();
        buyerWallet.setBalance(currentBalance - finalPrice);
        buyerWallet.setHoldBalance(Math.max(0L, currentHold - depositAmount));
        buyerWallet.setUpdatedAt(now);
        walletRepository.save(buyerWallet);

        if (finalPrice > 0) {
            transactionRepository.save(new Transaction(
                    buyerWallet,
                    finalPrice,
                    "AUCTION_PAYMENT",
                    "COMPLETED",
                    "AUC-PAY-" + auctionId,
                    "Final payment for auction " + auctionId
                            + " (deposit applied: " + depositAmount
                            + ", remaining due: " + remainingDueAfterDeposit + ")",
                    now
            ));
        }

        if (deposit != null) {
            deposit.setStatus("APPLIED_TO_PAYMENT");
            deposit.setSettlementType("APPLIED_TO_PAYMENT");
            deposit.setSettledAt(now);
            auctionDepositRepository.save(deposit);
        }

        // Platform-owned listings (posted by Admin): 100% to admin wallet.
        // Regular seller listings: 20% commission to admin, 80% to seller.
        boolean platformListing = isAdminSeller(auction);

        if (platformListing) {
            Wallet adminWallet = getAdminWallet(now);
            if (adminWallet != null && finalPrice > 0) {
                long adminBalance = adminWallet.getBalance() != null ? adminWallet.getBalance() : 0L;
                adminWallet.setBalance(adminBalance + finalPrice);
                adminWallet.setUpdatedAt(now);
                walletRepository.save(adminWallet);
                transactionRepository.save(new Transaction(
                        adminWallet,
                        finalPrice,
                        "ADMIN_AUCTION_REVENUE",
                        "COMPLETED",
                        "AUC-ADMIN-REV-" + auctionId,
                        "Full revenue (100%) for platform listing auction " + auctionId,
                        now
                ));
            }
        } else {
            long commission = Math.round(finalPrice * PLATFORM_COMMISSION_RATE);
            long sellerAmount = Math.max(0L, finalPrice - commission);

            Wallet sellerWallet = null;
            if (auction.getProduct() != null && auction.getProduct().getSellerId() != null) {
                sellerWallet = walletRepository.findByUser_Id(Math.toIntExact(auction.getProduct().getSellerId())).orElse(null);
            }
            if (sellerWallet != null) {
                long sellerBalance = sellerWallet.getBalance() != null ? sellerWallet.getBalance() : 0L;
                sellerWallet.setBalance(sellerBalance + sellerAmount);
                sellerWallet.setUpdatedAt(now);
                walletRepository.save(sellerWallet);
                transactionRepository.save(new Transaction(
                        sellerWallet,
                        sellerAmount,
                        "AUCTION_PAYOUT",
                        "COMPLETED",
                        "AUC-PAYOUT-" + auctionId,
                        "Payout (80%) for auction " + auctionId,
                        now
                ));
            }

            Wallet adminWallet = getAdminWallet(now);
            if (adminWallet != null && commission > 0) {
                long adminBalance = adminWallet.getBalance() != null ? adminWallet.getBalance() : 0L;
                adminWallet.setBalance(adminBalance + commission);
                adminWallet.setUpdatedAt(now);
                walletRepository.save(adminWallet);
                transactionRepository.save(new Transaction(
                        adminWallet,
                        commission,
                        "PLATFORM_COMMISSION",
                        "COMPLETED",
                        "AUC-COMMISSION-" + auctionId,
                        "Platform commission (20%) for auction " + auctionId,
                        now
                ));
            }
        }

        auction.setStatus("PAID");
        auction.setPaymentStatus("PAID");
        auction.setSettledAt(now);
        auctionRepository.save(auction);

        userRepository.findById(Math.toIntExact(userId))
                .ifPresent(u -> userPaymentStrikeService.recordSuccessfulPayment(u, auctionId));

        return AuctionPaymentResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .finalPrice(finalPrice)
                .depositApplied(depositAmount)
                .amountCharged(remainingDueAfterDeposit)
                .walletBalance(buyerWallet.getBalance())
                .walletHoldBalance(buyerWallet.getHoldBalance())
                .paymentStatus(auction.getPaymentStatus())
                .message("Auction payment completed successfully")
                .build();
    }

    /** Returns the platform admin wallet (first Admin user), creating it if missing. */
    private Wallet getAdminWallet(LocalDateTime now) {
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        if (admin == null) {
            return null;
        }
        return walletRepository.findByUser_Id(admin.getId()).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUser(admin);
            w.setBalance(0L);
            w.setHoldBalance(0L);
            w.setUpdatedAt(now);
            return walletRepository.save(w);
        });
    }

    /** True when the product was listed by an Admin account (platform-owned inventory). */
    private boolean isAdminSeller(Auction auction) {
        if (auction.getProduct() == null || auction.getProduct().getSellerId() == null) {
            return false;
        }
        return userRepository.findById(Math.toIntExact(auction.getProduct().getSellerId()))
                .map(u -> u.getRole() != null && "Admin".equalsIgnoreCase(u.getRole().getRoleName()))
                .orElse(false);
    }
}
