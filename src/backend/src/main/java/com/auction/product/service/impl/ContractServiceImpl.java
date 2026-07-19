package com.auction.product.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.product.dto.PurchaseContractPreviewDTO;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.repository.ContractRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ContractService;
import com.auction.product.service.ListingContractPdfService;
import com.auction.product.service.PurchaseContractPdfService;
import com.auction.product.service.SellerContractPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    public static final String TYPE_SELLER = "SELLER_AGREEMENT";
    public static final String TYPE_PURCHASE = "PURCHASE_AGREEMENT";

    /** In-memory acknowledgments until payment persists the purchase contract. */
    private final ConcurrentHashMap<String, LocalDateTime> purchaseContractAcknowledgments = new ConcurrentHashMap<>();

    private final ContractRepository contractRepository;
    private final SellerContractPdfService pdfService;
    private final PurchaseContractPdfService purchasePdfService;
    private final ListingContractPdfService listingContractPdfService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionDepositRepository auctionDepositRepository;

    @Override
    @Transactional
    public Contract signSellerContract(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId)).orElse(null);
        String fullName = user != null ? user.getFullName() : null;
        String email = user != null ? user.getEmail() : null;

        // Idempotent: a user only signs the seller agreement once.
        Contract existing = contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).orElse(null);
        if (existing != null) {
            // Ensure a real PDF exists (older rows may point at a placeholder .txt).
            if (existing.getFileUrl() == null || !existing.getFileUrl().endsWith(".pdf")) {
                String fileUrl = pdfService.generateAndStore(userId, fullName, email, existing.getCreatedAt());
                existing.setFileUrl(fileUrl);
                existing = contractRepository.save(existing);
            }
            return existing;
        }

        LocalDateTime now = LocalDateTime.now();
        String fileUrl = pdfService.generateAndStore(userId, fullName, email, now);
        Contract contract = new Contract();
        contract.setContractType(TYPE_SELLER);
        contract.setReferenceId(userId);
        contract.setFileUrl(fileUrl);
        contract.setCreatedAt(now);
        return contractRepository.save(contract);
    }

    @Override
    public Contract getSellerContract(Long userId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).orElse(null);
    }

    @Override
    public boolean hasSellerContract(Long userId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_SELLER, userId).isPresent();
    }

    @Override
    @Transactional
    public Contract createListingContract(Long productId, Long generatedBy) {
        // Check for existing contract to prevent duplicates
        if (contractRepository.findByContractTypeAndReferenceId("LISTING", productId).isPresent()) {
            throw new BusinessException("Listing contract already exists for product ID: " + productId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        User seller = product.getSellerId() != null
                ? userRepository.findById(Math.toIntExact(product.getSellerId())).orElse(null)
                : null;
        LocalDateTime now = LocalDateTime.now();
        String fileUrl = listingContractPdfService.generateAndStore(
                productId,
                product.getProductName(),
                seller != null ? displayName(seller) : "—",
                product.getStartingPrice(),
                now);

        Contract contract = new Contract();
        contract.setContractType("LISTING");
        contract.setReferenceId(productId);
        contract.setFileUrl(fileUrl);
        contract.setCreatedAt(now);
        return contractRepository.save(contract);
    }

    @Override
    public void acknowledgePurchaseContract(Long auctionId, Long buyerUserId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        assertWinner(auction, buyerUserId);
        if ("PAID".equalsIgnoreCase(auction.getPaymentStatus()) || "PAID".equalsIgnoreCase(auction.getStatus())) {
            throw new BusinessException("Phiên đấu giá đã được thanh toán.");
        }
        if (contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).isPresent()) {
            return;
        }
        purchaseContractAcknowledgments.put(purchaseAckKey(auctionId, buyerUserId), LocalDateTime.now());
    }

    @Override
    public boolean hasPurchaseContractAcknowledgment(Long auctionId, Long buyerUserId) {
        return purchaseContractAcknowledgments.containsKey(purchaseAckKey(auctionId, buyerUserId));
    }

    @Override
    @Transactional
    public Contract signPurchaseContract(Long auctionId, Long buyerUserId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        assertWinner(auction, buyerUserId);
        if ("PAID".equalsIgnoreCase(auction.getPaymentStatus()) || "PAID".equalsIgnoreCase(auction.getStatus())) {
            throw new BusinessException("Phiên đấu giá đã được thanh toán.");
        }

        Contract existing = contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).orElse(null);
        if (existing != null) {
            return existing;
        }

        User buyer = userRepository.findById(Math.toIntExact(buyerUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        PurchaseContext ctx = buildPurchaseContext(auction, buyer);
        LocalDateTime now = LocalDateTime.now();

        PurchaseContractPdfService.PurchaseContractData pdfData =
                new PurchaseContractPdfService.PurchaseContractData(
                        auctionId,
                        ctx.productName(),
                        ctx.productId(),
                        ctx.sellerName(),
                        ctx.sellerEmail(),
                        ctx.buyerName(),
                        ctx.buyerEmail(),
                        ctx.finalPrice(),
                        ctx.adminName(),
                        ctx.adminEmail(),
                        now
                );

        String fileUrl = purchasePdfService.generateAndStore(pdfData);
        Contract contract = new Contract();
        contract.setContractType(TYPE_PURCHASE);
        contract.setReferenceId(auctionId);
        contract.setFileUrl(fileUrl);
        contract.setCreatedAt(now);
        Contract saved = contractRepository.save(contract);
        purchaseContractAcknowledgments.remove(purchaseAckKey(auctionId, buyerUserId));
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseContractPreviewDTO getPurchaseContractPreview(Long auctionId, Long buyerUserId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        assertWinner(auction, buyerUserId);

        User buyer = userRepository.findById(Math.toIntExact(buyerUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        PurchaseContext ctx = buildPurchaseContext(auction, buyer);
        Contract existing = contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).orElse(null);
        boolean acknowledged = existing != null
                || hasPurchaseContractAcknowledgment(auctionId, buyerUserId);
        long depositAmount = auctionDepositRepository
                .findByAuction_AuctionIdAndUser_Id(auctionId, Math.toIntExact(buyerUserId))
                .map(AuctionDeposit::getDepositAmount)
                .orElse(0L);

        return PurchaseContractPreviewDTO.builder()
                .auctionId(auctionId)
                .productId(ctx.productId())
                .productName(ctx.productName())
                .finalPrice(ctx.finalPrice())
                .depositAmount(depositAmount)
                .remainingAmount(Math.max(0L, ctx.finalPrice() - depositAmount))
                .sellerName(ctx.sellerName())
                .sellerEmail(ctx.sellerEmail())
                .buyerName(ctx.buyerName())
                .buyerEmail(ctx.buyerEmail())
                .adminName(ctx.adminName())
                .adminEmail(ctx.adminEmail())
                .signed(existing != null)
                .acknowledged(acknowledged)
                .contractId(existing != null ? existing.getContractId() : null)
                .fileUrl(existing != null ? existing.getFileUrl() : null)
                .signedAt(existing != null && existing.getCreatedAt() != null
                        ? existing.getCreatedAt().toString() : null)
                .build();
    }

    @Override
    public Contract getPurchaseContract(Long auctionId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).orElse(null);
    }

    @Override
    public boolean hasPurchaseContract(Long auctionId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).isPresent();
    }

    @Override
    public boolean hasListingContract(Long productId) {
        return contractRepository.findByContractTypeAndReferenceId("LISTING", productId).isPresent();
    }

    @Override
    @Transactional
    public void deletePurchaseContract(Long auctionId) {
        contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId)
                .ifPresent(contractRepository::delete);
        purchaseContractAcknowledgments.entrySet().removeIf(e -> e.getKey().startsWith(auctionId + ":"));
    }

    private static String purchaseAckKey(Long auctionId, Long buyerUserId) {
        return auctionId + ":" + buyerUserId;
    }

    private void assertWinner(Auction auction, Long buyerUserId) {
        Long winnerId = resolveWinnerUserId(auction);
        if (winnerId == null || !winnerId.equals(buyerUserId)) {
            throw new BusinessException("Chỉ người thắng đấu giá mới được ký hợp đồng mua bán.");
        }
    }

    private Long resolveWinnerUserId(Auction auction) {
        Long fromSession = auctionSessionRepository.findById(auction.getAuctionId())
                .map(AuctionSession::getCurrentWinnerUserId)
                .orElse(null);
        if (fromSession != null) {
            return fromSession;
        }
        User winner = auction.getCurrentWinnerUser();
        return winner != null ? winner.getUserId() : null;
    }

    private record PurchaseContext(
            Long productId,
            String productName,
            long finalPrice,
            String sellerName,
            String sellerEmail,
            String buyerName,
            String buyerEmail,
            String adminName,
            String adminEmail
    ) {}

    private PurchaseContext buildPurchaseContext(Auction auction, User buyer) {
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        Long productId = auctionSessionRepository.findById(auction.getAuctionId())
                .map(AuctionSession::getProductId)
                .orElse(null);
        Product product = productId != null
                ? productRepository.findById(productId).orElse(null)
                : null;
        Long sellerId = product != null ? product.getSellerId() : null;
        User seller = sellerId != null
                ? userRepository.findById(Math.toIntExact(sellerId)).orElse(null)
                : null;

        boolean platformListing = seller != null && isAdminRole(seller);
        String sellerName = platformListing
                ? "CÔNG TY BIDZONE"
                : (seller != null ? displayName(seller) : "—");
        String sellerEmail = platformListing
                ? (admin != null ? admin.getEmail() : "admin@bidzone.vn")
                : (seller != null ? seller.getEmail() : "—");
        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;

        return new PurchaseContext(
                product != null ? product.getProductId() : null,
                product != null ? product.getProductName() : "—",
                finalPrice,
                sellerName,
                sellerEmail,
                displayName(buyer),
                buyer.getEmail(),
                admin != null ? displayName(admin) : "BidZone Admin",
                admin != null ? admin.getEmail() : "admin@bidzone.vn"
        );
    }

    private boolean isAdminRole(User user) {
        return user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getRoleName());
    }

    private String displayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            name = user.getEmail();
        }
        return name == null ? "#" + user.getUserId() : name;
    }
}

