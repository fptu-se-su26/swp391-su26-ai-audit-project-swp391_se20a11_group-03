package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.*;
import com.hoangxuananhtuan.auction.dto.DepositResponse;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.*;
import com.hoangxuananhtuan.auction.service.DepositService;
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        if (!"UPCOMING".equalsIgnoreCase(auction.getStatus()) && !"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalStateException("Deposit is only allowed for upcoming or active auctions");
        }

        LocalDateTime deadline = auction.getStartTime().minusMinutes(30);
        if (LocalDateTime.now().isAfter(deadline)) {
            throw new IllegalStateException("Deposit closed 30 minutes before auction starts");
        }

        Long depositAmount = Math.round(auction.getProduct().getStartingPrice() * 0.10d);
        if (wallet.getBalance() == null || wallet.getBalance() < depositAmount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        if (auctionDepositRepository.findByAuction_AuctionIdAndUser_UserId(auctionId, userId).isPresent()) {
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
        transaction.setDescription("Lock 10% deposit for auction " + auctionId);
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
