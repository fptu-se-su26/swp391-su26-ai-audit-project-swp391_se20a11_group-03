package com.auction.bidding.service.impl;

import com.auction.account.entity.User;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.account.dao.UserRepository;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.WalletRepository;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.bidding.repository.AuctionDepositRepository;

import com.auction.bidding.entity.*;
import com.auction.bidding.dto.DepositResponse;
import com.auction.bidding.util.DepositCalculator;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.bidding.repository.*;
import com.auction.bidding.service.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class DepositServiceImpl implements DepositService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AuctionDepositRepository auctionDepositRepository;

    @Override
    public DepositResponse createDeposit(Long auctionId, Long userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Wallet wallet = walletRepository.findByUser_Id(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        if (!"UPCOMING".equalsIgnoreCase(auction.getStatus()) && !"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalStateException("Deposit is only allowed for upcoming or active auctions");
        }

        LocalDateTime deadline = auction.getStartTime().minusMinutes(3);
        if (LocalDateTime.now().isAfter(deadline)) {
            throw new IllegalStateException("Deposit closed 3 minutes before auction starts");
        }

        long standardDeposit = DepositCalculator.calculate(auction.getProduct().getStartingPrice());
        long startingPrice = auction.getProduct().getStartingPrice();
        // Premium: waive below 1M; otherwise charge exactly 50% (integer VND, rounded down).
        long depositAmount = com.auction.premium.service.PremiumPolicy.deposit(
                startingPrice, standardDeposit, user.isPremium());
        if (wallet.getBalance() == null || wallet.getBalance() < depositAmount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        if (auctionDepositRepository.findByAuction_AuctionIdAndUser_Id(auctionId, Math.toIntExact(userId)).isPresent()) {
            throw new IllegalStateException("User already deposited for this auction");
        }

        wallet.setBalance(wallet.getBalance() - depositAmount);
        wallet.setHoldBalance((wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance()) + depositAmount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(depositAmount);
        transaction.setTransactionType("HOLD_BID");
        transaction.setStatus("COMPLETED");
        transaction.setDescription("Lock " + DepositCalculator.describeTier(auction.getProduct().getStartingPrice())
                + " deposit for auction " + auctionId);
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        AuctionDeposit deposit = new AuctionDeposit();
        deposit.setAuction(auction);
        deposit.setUser(user);
        deposit.setDepositAmount(depositAmount);
        deposit.setStatus("LOCKED");
        deposit.setCreatedAt(LocalDateTime.now());
        deposit = auctionDepositRepository.save(deposit);

        return DepositResponse.builder()
                .depositId(deposit.getDepositId())
                .auctionId(auctionId)
                .userId(userId)
                .depositAmount(depositAmount)
                .walletBalance(wallet.getBalance())
                .walletHoldBalance(wallet.getHoldBalance())
                .status(deposit.getStatus())
                .message("Deposit locked successfully")
                .build();
    }
}

