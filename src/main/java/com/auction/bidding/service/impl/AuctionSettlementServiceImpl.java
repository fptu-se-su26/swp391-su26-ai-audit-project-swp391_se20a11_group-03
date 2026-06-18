package com.auction.bidding.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionSettlementService;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionSettlementServiceImpl implements AuctionSettlementService {

    private static final Logger log = LoggerFactory.getLogger(AuctionSettlementServiceImpl.class);

    /** How long the winner has to pay after the auction ends. */
    public static final long PAYMENT_WINDOW_HOURS = 12L;

    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public int settleEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();
        int count = 0;
        for (Auction auction : auctionRepository.findAll()) {
            if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())
                    && !"UPCOMING".equalsIgnoreCase(auction.getStatus())) {
                continue;
            }
            if (auction.getEndTime() == null || auction.getEndTime().isAfter(now)) {
                continue;
            }
            if (auction.getCurrentWinnerUser() == null) {
                // Nobody bid — just mark ended with no winner
                auction.setStatus("ENDED");
                auction.setPaymentStatus("NO_WINNER");
                auction.setSettledAt(now);
                auctionRepository.save(auction);
                // Refund everyone who deposited
                refundAllDeposits(auction, now);
                count++;
                continue;
            }
            // We have a winner — move to AWAITING_PAYMENT
            auction.setStatus("AWAITING_PAYMENT");
            auction.setPaymentStatus("AWAITING_PAYMENT");
            auction.setPaymentDeadline(auction.getEndTime().plusHours(PAYMENT_WINDOW_HOURS));
            auction.setSettledAt(now);
            auctionRepository.save(auction);

            // Mark the winner's deposit as HELD_FOR_PAYMENT
            auctionDepositRepository
                    .findByAuction_AuctionIdAndUser_Id(
                            auction.getAuctionId(),
                            auction.getCurrentWinnerUser().getId())
                    .ifPresent(deposit -> {
                        deposit.setStatus("HELD_FOR_PAYMENT");
                        auctionDepositRepository.save(deposit);
                    });
            count++;
        }
        return count;
    }

    @Override
    @Transactional
    public int forfeitExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now();
        int count = 0;
        for (Auction auction : auctionRepository.findAll()) {
            if (!"AWAITING_PAYMENT".equalsIgnoreCase(auction.getStatus())
                    && !"AWAITING_PAYMENT".equalsIgnoreCase(auction.getPaymentStatus())) {
                continue;
            }
            if (auction.getPaymentDeadline() == null || auction.getPaymentDeadline().isAfter(now)) {
                continue;
            }
            if (auction.getCurrentWinnerUser() == null) {
                // Defensive: shouldn't happen but skip
                continue;
            }

            // Forfeit winner's deposit to platform
            auctionDepositRepository
                    .findByAuction_AuctionIdAndUser_Id(
                            auction.getAuctionId(),
                            auction.getCurrentWinnerUser().getId())
                    .ifPresent(deposit -> forfeitWinnerDeposit(auction, deposit, now));

            // Refund losers
            refundLoserDeposits(auction, now);

            auction.setStatus("FORFEITED");
            auction.setPaymentStatus("FORFEITED");
            auction.setSettledAt(now);
            auctionRepository.save(auction);
            count++;
        }
        return count;
    }

    private void forfeitWinnerDeposit(Auction auction, AuctionDeposit deposit, LocalDateTime now) {
        Wallet wallet = walletRepository
                .findByUser_Id(Math.toIntExact(deposit.getUser().getId()))
                .orElse(null);
        if (wallet == null) {
            log.warn("Cannot forfeit deposit {} — wallet not found for user {}",
                    deposit.getDepositId(), deposit.getUser().getId());
            return;
        }
        long amount = deposit.getDepositAmount() != null ? deposit.getDepositAmount() : 0L;
        long currentHold = wallet.getHoldBalance() != null ? wallet.getHoldBalance() : 0L;
        wallet.setHoldBalance(Math.max(0, currentHold - amount));
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);

        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setAmount(amount);
        tx.setTransactionType("FORFEIT_DEPOSIT");
        tx.setStatus("SUCCESS");
        tx.setReferenceCode("FORFEIT-" + auction.getAuctionId());
        tx.setDescription("Deposit forfeited to platform (auction " + auction.getAuctionId() + " winner did not pay)");
        tx.setCreatedAt(now);
        transactionRepository.save(tx);

        deposit.setStatus("FORFEITED");
        deposit.setSettlementType("FORFEITED");
        deposit.setSettledAt(now);
        auctionDepositRepository.save(deposit);
    }

    private void refundLoserDeposits(Auction auction, LocalDateTime now) {
        List<AuctionDeposit> deposits = auctionDepositRepository.findByAuction_AuctionId(auction.getAuctionId());
        for (AuctionDeposit deposit : deposits) {
            if (deposit.getUser() == null) continue;
            if (auction.getCurrentWinnerUser() != null
                    && deposit.getUser().getId() == auction.getCurrentWinnerUser().getId()) {
                continue; // skip winner — already handled above
            }
            if ("REFUNDED".equalsIgnoreCase(deposit.getSettlementType())
                    || "FORFEITED".equalsIgnoreCase(deposit.getSettlementType())) {
                continue;
            }
            refundOneDeposit(auction, deposit, now);
        }
    }

    private void refundAllDeposits(Auction auction, LocalDateTime now) {
        List<AuctionDeposit> deposits = auctionDepositRepository.findByAuction_AuctionId(auction.getAuctionId());
        for (AuctionDeposit deposit : deposits) {
            if ("REFUNDED".equalsIgnoreCase(deposit.getSettlementType())) continue;
            refundOneDeposit(auction, deposit, now);
        }
    }

    private void refundOneDeposit(Auction auction, AuctionDeposit deposit, LocalDateTime now) {
        Wallet wallet = walletRepository
                .findByUser_Id(Math.toIntExact(deposit.getUser().getId()))
                .orElse(null);
        if (wallet == null) {
            log.warn("Cannot refund deposit {} — wallet not found for user {}",
                    deposit.getDepositId(), deposit.getUser().getId());
            return;
        }
        long amount = deposit.getDepositAmount() != null ? deposit.getDepositAmount() : 0L;
        long currentHold = wallet.getHoldBalance() != null ? wallet.getHoldBalance() : 0L;
        long currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
        wallet.setHoldBalance(Math.max(0, currentHold - amount));
        wallet.setBalance(currentBalance + amount);
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);

        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setAmount(amount);
        tx.setTransactionType("REFUND_DEPOSIT");
        tx.setStatus("SUCCESS");
        tx.setReferenceCode("REFUND-" + auction.getAuctionId());
        tx.setDescription("Deposit refunded for auction " + auction.getAuctionId());
        tx.setCreatedAt(now);
        transactionRepository.save(tx);

        deposit.setStatus("REFUNDED");
        deposit.setSettlementType("REFUNDED");
        deposit.setSettledAt(now);
        auctionDepositRepository.save(deposit);
    }
}
