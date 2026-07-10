package com.auction.wallet.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.wallet.dto.DepositRequest;
import com.auction.wallet.dto.DepositQrResponse;
import com.auction.wallet.dto.SepayWebhookRequest;
import com.auction.wallet.dto.WalletResponse;
import com.auction.wallet.dto.WithdrawRequest;
import com.auction.wallet.dto.WithdrawalResponse;
import com.auction.wallet.dto.WithdrawalStatusRequest;
import com.auction.wallet.dto.WalletTransactionDTO;
import com.auction.wallet.service.TransactionLedgerService;
import com.auction.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final TransactionLedgerService transactionLedgerService;

    @GetMapping("/api/wallet")
    public ResponseEntity<WalletResponse> getMyWallet(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(walletService.getWalletByUserId(user.getId()));
    }

    @GetMapping("/api/wallets/user/{userId}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    @PostMapping("/api/wallet/deposit")
    public ResponseEntity<DepositQrResponse> createDeposit(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody DepositRequest request
    ) {
        return ResponseEntity.ok(walletService.createDepositQr(user.getId(), request.getAmount()));
    }

    @PostMapping("/api/wallet/sepay-webhook")
    public ResponseEntity<Map<String, Object>> receiveSepayWebhook(@RequestBody SepayWebhookRequest request) {
        return ResponseEntity.ok(walletService.handleSepayWebhook(request));
    }

    @PostMapping("/api/wallet/withdraw")
    public ResponseEntity<WithdrawalResponse> createWithdrawal(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody WithdrawRequest request
    ) {
        return ResponseEntity.ok(walletService.createWithdrawal(user.getId(), request));
    }

    @GetMapping("/api/wallet/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getMyWithdrawals(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(walletService.getWithdrawalsByUserId(user.getId()));
    }

    @GetMapping("/api/wallet/transactions")
    public ResponseEntity<List<WalletTransactionDTO>> getMyTransactions(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(transactionLedgerService.getUserTransactions(user.getId(), from, to, type));
    }

    @GetMapping("/api/staff/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getWithdrawals(@RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(walletService.getWithdrawals(status));
    }

    @PutMapping("/api/staff/withdrawals/{id}/status")
    public ResponseEntity<WithdrawalResponse> updateWithdrawalStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody WithdrawalStatusRequest request
    ) {
        return ResponseEntity.ok(walletService.updateWithdrawalStatus(id, request));
    }
}
