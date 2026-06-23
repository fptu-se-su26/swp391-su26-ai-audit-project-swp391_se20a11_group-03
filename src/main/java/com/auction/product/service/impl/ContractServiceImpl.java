package com.auction.product.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.repository.ContractRepository;
import com.auction.product.service.ContractService;
import com.auction.product.service.PurchaseContractPdfService;
import com.auction.product.service.SellerContractPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    public static final String TYPE_SELLER = "SELLER_AGREEMENT";
    public static final String TYPE_PURCHASE = "PURCHASE_AGREEMENT";

    private final ContractRepository contractRepository;
    private final SellerContractPdfService pdfService;
    private final PurchaseContractPdfService purchasePdfService;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

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

        Contract contract = new Contract();
        contract.setContractType("LISTING");
        contract.setReferenceId(productId);
        // TODO: Replace with actual PDF generation service
        contract.setFileUrl("/contracts/listing_" + productId + ".pdf");
        contract.setCreatedAt(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract signPurchaseContract(Long auctionId, Long buyerUserId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getCurrentWinnerUser() == null
                || auction.getCurrentWinnerUser().getId() != buyerUserId.intValue()) {
            throw new BusinessException("Chỉ người thắng đấu giá mới được ký hợp đồng mua bán.");
        }
        if ("PAID".equalsIgnoreCase(auction.getPaymentStatus()) || "PAID".equalsIgnoreCase(auction.getStatus())) {
            throw new BusinessException("Phiên đấu giá đã được thanh toán.");
        }

        Contract existing = contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).orElse(null);
        if (existing != null) {
            return existing;
        }

        User buyer = userRepository.findById(Math.toIntExact(buyerUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);

        Product product = auction.getProduct();
        Long sellerId = product != null ? product.getSellerId() : null;
        User seller = sellerId != null
                ? userRepository.findById(Math.toIntExact(sellerId)).orElse(null)
                : null;

        boolean platformListing = seller != null && isAdminRole(seller);
        String sellerName = platformListing
                ? "CÔNG TY LUXEAUCTION"
                : (seller != null ? displayName(seller) : "—");
        String sellerEmail = platformListing
                ? (admin != null ? admin.getEmail() : "admin@luxeauction.vn")
                : (seller != null ? seller.getEmail() : "—");

        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;
        LocalDateTime now = LocalDateTime.now();

        PurchaseContractPdfService.PurchaseContractData pdfData =
                new PurchaseContractPdfService.PurchaseContractData(
                        auctionId,
                        product != null ? product.getProductName() : "—",
                        product != null ? product.getProductId() : null,
                        sellerName,
                        sellerEmail,
                        displayName(buyer),
                        buyer.getEmail(),
                        finalPrice,
                        admin != null ? displayName(admin) : "LuxeAuction Admin",
                        admin != null ? admin.getEmail() : "admin@luxeauction.vn",
                        now
                );

        String fileUrl = purchasePdfService.generateAndStore(pdfData);
        Contract contract = new Contract();
        contract.setContractType(TYPE_PURCHASE);
        contract.setReferenceId(auctionId);
        contract.setFileUrl(fileUrl);
        contract.setCreatedAt(now);
        return contractRepository.save(contract);
    }

    @Override
    public Contract getPurchaseContract(Long auctionId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).orElse(null);
    }

    @Override
    public boolean hasPurchaseContract(Long auctionId) {
        return contractRepository.findByContractTypeAndReferenceId(TYPE_PURCHASE, auctionId).isPresent();
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

