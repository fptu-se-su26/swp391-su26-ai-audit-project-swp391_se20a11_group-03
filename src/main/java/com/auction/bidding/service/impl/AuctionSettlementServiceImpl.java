package com.auction.bidding.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.service.UserPaymentStrikeService;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.service.AuctionSettlementService;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ContractService;
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

    /** How long the winner has to pay after the auction ends (3 days). */
    public static final long PAYMENT_WINDOW_HOURS = 72L;

    private enum RescheduleReason {
        NO_BIDS,
        WINNER_NO_PAY
    }

    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final BidRepository bidRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final ContractService contractService;
    private final UserPaymentStrikeService userPaymentStrikeService;

    @Override
    @Transactional
    public int settleEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();
        int count = 0;
        for (Auction auction : auctionRepository.findAll()) {
            // Key off settledAt (not status) so we still settle auctions that the
            // AuctionStatusSyncScheduler may have already flipped to ENDED.
            if (auction.getSettledAt() != null) {
                continue;
            }
            // Skip auctions already in a terminal settled state.
            if ("AWAITING_PAYMENT".equalsIgnoreCase(auction.getStatus())
                    || "PAID".equalsIgnoreCase(auction.getStatus())
                    || "FORFEITED".equalsIgnoreCase(auction.getStatus())) {
                continue;
            }
            if (auction.getEndTime() == null || auction.getEndTime().isAfter(now)) {
                continue;
            }
            long bidCount = bidRepository.findByAuctionIdOrderByBidAmountDesc(auction.getAuctionId()).size();
            boolean noWinner = bidCount == 0 || auction.getCurrentWinnerUser() == null;
            if (noWinner) {
                auction.setStatus("ENDED");
                auction.setPaymentStatus("NO_WINNER");
                auction.setSettledAt(now);
                auctionRepository.save(auction);
                refundAllDeposits(auction, now);
                notifyDepositorsRefunded(auction, true);
                queueProductForReschedule(auction, RescheduleReason.NO_BIDS);
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
            // Losers get their deposit unlocked back to balance as soon as the auction ends.
            refundLoserDeposits(auction, now);
            notifyAuctionWinner(auction);
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

            notifyWinnerForfeited(auction);
            userPaymentStrikeService.recordForfeit(
                    auction.getCurrentWinnerUser(),
                    auction.getAuctionId());
            queueProductForReschedule(auction, RescheduleReason.WINNER_NO_PAY);
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

        // The forfeited deposit becomes platform revenue: credit the admin wallet.
        Wallet adminWallet = getAdminWallet(now);
        if (adminWallet != null && amount > 0) {
            long adminBalance = adminWallet.getBalance() != null ? adminWallet.getBalance() : 0L;
            adminWallet.setBalance(adminBalance + amount);
            adminWallet.setUpdatedAt(now);
            walletRepository.save(adminWallet);

            Transaction adminTx = new Transaction();
            adminTx.setWallet(adminWallet);
            adminTx.setAmount(amount);
            adminTx.setTransactionType("FORFEIT_DEPOSIT");
            adminTx.setStatus("COMPLETED");
            adminTx.setReferenceCode("FORFEIT-" + auction.getAuctionId());
            adminTx.setDescription("Forfeited deposit from auction " + auction.getAuctionId() + " (winner did not pay)");
            adminTx.setCreatedAt(now);
            transactionRepository.save(adminTx);
        }

        deposit.setStatus("FORFEITED");
        deposit.setSettlementType("FORFEITED");
        deposit.setSettledAt(now);
        auctionDepositRepository.save(deposit);
    }

    private void notifyAuctionWinner(Auction auction) {
        if (auction.getCurrentWinnerUser() == null) {
            return;
        }
        Product product = auction.getProduct();
        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;
        String productName = product != null ? product.getProductName() : "sản phẩm";
        notificationService.createNotification(
                (long) auction.getCurrentWinnerUser().getId(),
                "Chúc mừng! Bạn đã thắng đấu giá",
                String.format(
                        "Bạn thắng \"%s\" với giá %,d VND. Vui lòng thanh toán trong 3 ngày.",
                        productName,
                        finalPrice),
                Notification.NotificationType.GENERAL,
                auction.getAuctionId(),
                "AUCTION_WON"
        );
    }

    private void notifyWinnerForfeited(Auction auction) {
        if (auction.getCurrentWinnerUser() == null) {
            return;
        }
        Product product = auction.getProduct();
        String productName = product != null ? product.getProductName() : "sản phẩm";
        notificationService.createNotification(
                (long) auction.getCurrentWinnerUser().getId(),
                "Quá hạn thanh toán",
                String.format(
                        "Sản phẩm \"%s\" đã quá hạn thanh toán. Tiền cọc của bạn sẽ không được hoàn.",
                        productName),
                Notification.NotificationType.PAYMENT_REQUIRED,
                auction.getAuctionId(),
                "AUCTION_FORFEITED"
        );
    }

    /**
     * No winner or winner did not pay — put the product back on the admin/staff approval queue.
     * Starting price is unchanged; staff can schedule a new auction session on approve.
     */
    private void queueProductForReschedule(Auction auction, RescheduleReason reason) {
        Product product = auction.getProduct();
        if (product == null) {
            return;
        }
        product.setStatus("PENDING");
        product.setScheduledStartTime(null);
        product.setScheduledDurationSeconds(null);
        if (reason == RescheduleReason.NO_BIDS) {
            product.setRejectionReason(
                    "Phiên đấu giá kết thúc không có lượt đặt giá (hoặc chỉ có người đặt cọc). "
                            + "Chờ admin/staff lên lịch đấu giá lại — giá khởi điểm giữ nguyên.");
        } else {
            product.setRejectionReason(
                    "Người thắng không thanh toán trong 3 ngày. Chờ admin duyệt đấu giá lại (giá khởi điểm giữ nguyên).");
        }
        productRepository.save(product);

        if (reason == RescheduleReason.WINNER_NO_PAY) {
            contractService.deletePurchaseContract(auction.getAuctionId());
        }

        long startingPrice = product.getStartingPrice() != null ? product.getStartingPrice() : 0L;
        String title = reason == RescheduleReason.NO_BIDS
                ? "Sản phẩm chờ lên sàn lại (không có giá)"
                : "Sản phẩm chờ đấu giá lại";
        String staffMessage = reason == RescheduleReason.NO_BIDS
                ? String.format(
                        "Phiên #%d — \"%s\": kết thúc không có lượt đặt giá. "
                                + "Tiền cọc đã hoàn cho người tham gia. Vui lòng lên lịch đấu giá lại (giá khởi điểm %,d VND).",
                        auction.getAuctionId(),
                        product.getProductName(),
                        startingPrice)
                : String.format(
                        "Phiên đấu giá #%d — \"%s\": người thắng không thanh toán đúng hạn. "
                                + "Sản phẩm đã vào hàng chờ duyệt với giá khởi điểm %,d VND.",
                        auction.getAuctionId(),
                        product.getProductName(),
                        startingPrice);

        notifyRoleUsers("Admin", title, staffMessage, product.getProductId());
        notifyRoleUsers("Staff", title, staffMessage, product.getProductId());

        if (product.getSellerId() != null) {
            String sellerMessage = reason == RescheduleReason.NO_BIDS
                    ? "Sản phẩm \"" + product.getProductName()
                    + "\" đã kết thúc phiên mà không có lượt đặt giá. "
                    + "Sản phẩm đang chờ admin/staff lên lịch đấu giá lại (giá khởi điểm giữ nguyên)."
                    : "Sản phẩm \"" + product.getProductName()
                    + "\" đã vào hàng chờ duyệt đấu giá lại (giá khởi điểm giữ nguyên).";
            notificationService.createNotification(
                    product.getSellerId().longValue(),
                    title,
                    sellerMessage,
                    Notification.NotificationType.GENERAL,
                    product.getProductId(),
                    "PRODUCT_RELIST"
            );
        }

        if (reason == RescheduleReason.WINNER_NO_PAY && auction.getCurrentWinnerUser() != null) {
            notificationService.createNotification(
                    (long) auction.getCurrentWinnerUser().getId(),
                    "Đã hết hạn thanh toán",
                    "Bạn không thanh toán sản phẩm \"" + product.getProductName()
                            + "\" trong 3 ngày. Tiền cọc có thể bị tịch thu theo quy định.",
                    Notification.NotificationType.GENERAL,
                    auction.getAuctionId(),
                    "AUCTION_FORFEIT"
            );
        }
    }

    private void notifyDepositorsRefunded(Auction auction, boolean noWinnerSession) {
        Product product = auction.getProduct();
        String productName = product != null ? product.getProductName() : "sản phẩm";
        List<AuctionDeposit> deposits = auctionDepositRepository.findByAuction_AuctionId(auction.getAuctionId());
        for (AuctionDeposit deposit : deposits) {
            if (deposit.getUser() == null) {
                continue;
            }
            if (!"REFUNDED".equalsIgnoreCase(deposit.getSettlementType())) {
                continue;
            }
            String message = noWinnerSession
                    ? "Phiên đấu giá \"" + productName
                    + "\" đã kết thúc không có người thắng. Tiền cọc của bạn đã được hoàn về ví."
                    : "Phiên đấu giá \"" + productName
                    + "\" đã kết thúc. Tiền cọc của bạn đã được hoàn về ví.";
            notificationService.createNotification(
                    (long) deposit.getUser().getId(),
                    "Hoàn tiền cọc",
                    message,
                    Notification.NotificationType.GENERAL,
                    auction.getAuctionId(),
                    "DEPOSIT_REFUND"
            );
        }
    }

    private void notifyRoleUsers(String roleName, String title, String message, Long productId) {
        for (com.auction.account.entity.User user : userRepository.findAllByRole_RoleName(roleName)) {
            notificationService.createNotification(
                    user.getUserId().longValue(),
                    title,
                    message,
                    Notification.NotificationType.GENERAL,
                    productId,
                    "PRODUCT_RELIST"
            );
        }
    }

    /** Returns the platform admin wallet (first Admin user), creating it if missing. */
    private Wallet getAdminWallet(LocalDateTime now) {
        com.auction.account.entity.User admin = userRepository
                .findFirstByRole_RoleNameOrderByIdAsc("Admin")
                .orElse(null);
        if (admin == null) {
            log.warn("No Admin user found to receive platform revenue");
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
