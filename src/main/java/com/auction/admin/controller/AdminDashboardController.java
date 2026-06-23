package com.auction.admin.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.admin.dto.ContractRowDTO;
import com.auction.admin.dto.DailyRevenueDTO;
import com.auction.admin.dto.DashboardSummaryDTO;
import com.auction.admin.dto.SalesHistoryDTO;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.common.dto.ApiResponse;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.product.repository.ContractRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Admin statistics dashboard. Aggregates real data from transactions, users,
 * products and auctions. Secured for Admin/Staff in SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private static final String TYPE_DEPOSIT = "DEPOSIT";
    private static final String TYPE_HOLD_BID = "HOLD_BID";
    private static final String TYPE_WITHDRAWAL = "WITHDRAWAL";
    private static final String TYPE_COMMISSION = "PLATFORM_COMMISSION";
    private static final String TYPE_ADMIN_REVENUE = "ADMIN_AUCTION_REVENUE";
    private static final String TYPE_FORFEIT = "FORFEIT_DEPOSIT";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_PENDING = "PENDING";

    private static final double COMMISSION_RATE = 0.20;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final ContractRepository contractRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getSummary() {
        List<Transaction> txns = transactionRepository.findAll();

        // Admin revenue = platform commission + admin-owned auction revenue + forfeited deposits.
        long totalRevenue = sumByType(txns, TYPE_COMMISSION, STATUS_COMPLETED)
                + sumByType(txns, TYPE_ADMIN_REVENUE, STATUS_COMPLETED)
                + sumByType(txns, TYPE_FORFEIT, STATUS_COMPLETED);
        long totalTopUps = sumByType(txns, TYPE_DEPOSIT, STATUS_COMPLETED);
        long depositsHeld = txns.stream()
                .filter(t -> TYPE_HOLD_BID.equalsIgnoreCase(t.getTransactionType()))
                .mapToLong(t -> t.getAmount() == null ? 0L : t.getAmount())
                .sum();
        long pendingWithdrawals = txns.stream()
                .filter(t -> TYPE_WITHDRAWAL.equalsIgnoreCase(t.getTransactionType())
                        && STATUS_PENDING.equalsIgnoreCase(t.getStatus()))
                .count();

        long activeAuctions = auctionRepository.findAll().stream()
                .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                .count();

        DashboardSummaryDTO summary = DashboardSummaryDTO.builder()
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .totalAuctions(auctionRepository.count())
                .activeAuctions(activeAuctions)
                .totalRevenue(totalRevenue)
                .totalTopUps(totalTopUps)
                .depositsHeld(depositsHeld)
                .pendingWithdrawals(pendingWithdrawals)
                .adminBalance(adminBalance())
                .build();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<DailyRevenueDTO>>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false, defaultValue = "day") String groupBy) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.plusDays(1).atStartOfDay() : null;
        boolean byMonth = "month".equalsIgnoreCase(groupBy);

        Map<String, long[]> buckets = new TreeMap<>(); // periodKey -> [amount, count]
        for (Transaction t : transactionRepository.findAll()) {
            boolean isRevenue = TYPE_COMMISSION.equalsIgnoreCase(t.getTransactionType())
                    || TYPE_ADMIN_REVENUE.equalsIgnoreCase(t.getTransactionType())
                    || TYPE_FORFEIT.equalsIgnoreCase(t.getTransactionType());
            if (!isRevenue
                    || !STATUS_COMPLETED.equalsIgnoreCase(t.getStatus())
                    || t.getCreatedAt() == null) {
                continue;
            }
            if (fromDt != null && t.getCreatedAt().isBefore(fromDt)) continue;
            if (toDt != null && !t.getCreatedAt().isBefore(toDt)) continue;
            LocalDate date = t.getCreatedAt().toLocalDate();
            String key = byMonth
                    ? String.format("%04d-%02d", date.getYear(), date.getMonthValue())
                    : date.toString();
            long[] agg = buckets.computeIfAbsent(key, k -> new long[2]);
            agg[0] += t.getAmount() == null ? 0L : t.getAmount();
            agg[1] += 1;
        }

        List<DailyRevenueDTO> result = new ArrayList<>();
        for (Map.Entry<String, long[]> e : buckets.entrySet()) {
            result.add(new DailyRevenueDTO(e.getKey(), e.getValue()[0], e.getValue()[1]));
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /** Platform purchase/sales history: settled (paid) auctions, newest first. */
    @GetMapping("/sales-history")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<SalesHistoryDTO>>> getSalesHistory() {
        List<SalesHistoryDTO> rows = new ArrayList<>();
        for (Auction auction : auctionRepository.findAll()) {
            boolean paid = "PAID".equalsIgnoreCase(auction.getStatus())
                    || "PAID".equalsIgnoreCase(auction.getPaymentStatus());
            if (!paid) {
                continue;
            }

            Product product = auction.getProduct();
            long finalPrice = auction.getCurrentHighestBid() == null ? 0L : auction.getCurrentHighestBid();
            boolean platformListing = isAdminSeller(auction.getProduct() != null ? auction.getProduct().getSellerId() : null);
            long commission = platformListing ? finalPrice : Math.round(finalPrice * COMMISSION_RATE);

            String sellerName = product != null ? userName(product.getSellerId()) : "—";
            String buyerName = auction.getCurrentWinnerUser() != null
                    ? displayName(auction.getCurrentWinnerUser())
                    : "—";
            LocalDateTime paidAt = auction.getSettledAt() != null ? auction.getSettledAt() : auction.getEndTime();

            rows.add(SalesHistoryDTO.builder()
                    .auctionId(auction.getAuctionId())
                    .productId(product != null ? product.getProductId() : null)
                    .productName(product != null ? product.getProductName() : "—")
                    .sellerName(sellerName)
                    .buyerName(buyerName)
                    .finalPrice(finalPrice)
                    .commission(commission)
                    .sellerPayout(finalPrice - commission)
                    .status(auction.getStatus())
                    .paymentStatus(auction.getPaymentStatus())
                    .paidAt(paidAt == null ? null : paidAt.toString())
                    .build());
        }
        rows.sort(Comparator.comparing(SalesHistoryDTO::getPaidAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    /** All electronic contracts (seller agreements + listing contracts), newest first. */
    @GetMapping("/contracts")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ContractRowDTO>>> getContracts() {
        List<ContractRowDTO> rows = new ArrayList<>();
        for (Contract c : contractRepository.findAll()) {
            String type = c.getContractType();
            boolean isSeller = "SELLER_AGREEMENT".equalsIgnoreCase(type);
            String typeLabel = switch (type != null ? type.toUpperCase() : "") {
                case "SELLER_AGREEMENT" -> "Hợp đồng người bán";
                case "LISTING" -> "Hợp đồng niêm yết";
                case "PURCHASE_AGREEMENT" -> "Hợp đồng mua bán";
                default -> type;
            };

            String referenceName;
            if (isSeller) {
                referenceName = userName(c.getReferenceId());
            } else if ("PURCHASE_AGREEMENT".equalsIgnoreCase(type)) {
                referenceName = "Phiên đấu giá #" + c.getReferenceId();
            } else {
                referenceName = productRepository.findById(c.getReferenceId())
                        .map(Product::getProductName)
                        .orElse("#" + c.getReferenceId());
            }

            rows.add(ContractRowDTO.builder()
                    .contractId(c.getContractId())
                    .contractType(type)
                    .typeLabel(typeLabel)
                    .referenceId(c.getReferenceId())
                    .referenceName(referenceName)
                    .fileUrl(c.getFileUrl())
                    .createdAt(c.getCreatedAt() == null ? null : c.getCreatedAt().toString())
                    .build());
        }
        rows.sort(Comparator.comparing(ContractRowDTO::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    private String userName(Long userId) {
        if (userId == null) {
            return "—";
        }
        return userRepository.findById(Math.toIntExact(userId))
                .map(this::displayName)
                .orElse("#" + userId);
    }

    private String displayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            name = user.getEmail();
        }
        return name == null ? "#" + user.getUserId() : name;
    }

    private long sumByType(List<Transaction> txns, String type, String status) {
        return txns.stream()
                .filter(t -> type.equalsIgnoreCase(t.getTransactionType())
                        && status.equalsIgnoreCase(t.getStatus()))
                .mapToLong(t -> t.getAmount() == null ? 0L : t.getAmount())
                .sum();
    }

    private long adminBalance() {
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        if (admin == null) {
            return 0L;
        }
        return walletRepository.findByUser_Id(admin.getId())
                .map(Wallet::getBalance)
                .map(b -> b == null ? 0L : b)
                .orElse(0L);
    }

    private boolean isAdminSeller(Long sellerId) {
        if (sellerId == null) {
            return false;
        }
        return userRepository.findById(Math.toIntExact(sellerId))
                .map(u -> u.getRole() != null && "Admin".equalsIgnoreCase(u.getRole().getRoleName()))
                .orElse(false);
    }
}
