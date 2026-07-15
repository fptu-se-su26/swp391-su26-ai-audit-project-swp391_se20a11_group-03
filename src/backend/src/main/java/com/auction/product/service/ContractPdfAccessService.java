package com.auction.product.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.product.repository.ContractRepository;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractPdfAccessService {

    private final ContractRepository contractRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final SellerContractPdfService sellerContractPdfService;
    private final PurchaseContractPdfService purchaseContractPdfService;
    private final ListingContractPdfService listingContractPdfService;

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    @Transactional
    public Path resolvePdfPath(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));

        Path existing = toLocalPath(contract.getFileUrl());
        if (existing != null && Files.isRegularFile(existing)) {
            return existing;
        }

        String fileUrl = regenerateAndPersist(contract);
        Path regenerated = toLocalPath(fileUrl);
        if (regenerated != null && Files.isRegularFile(regenerated)) {
            return regenerated;
        }

        throw new ResourceNotFoundException("PDF file not available for contract " + contractId);
    }

    /** Returns PDF bytes, regenerating in memory (and persisting when possible) if the file is missing. */
    @Transactional
    public byte[] resolvePdfBytes(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));

        Path existing = toLocalPath(contract.getFileUrl());
        if (existing != null && Files.isRegularFile(existing)) {
            try {
                return Files.readAllBytes(existing);
            } catch (Exception ex) {
                log.warn("Could not read contract PDF at {}, regenerating", existing, ex);
            }
        }

        byte[] pdf = renderPdfBytes(contract);
        if (pdf.length == 0) {
            throw new ResourceNotFoundException("PDF file not available for contract " + contractId);
        }

        String fileUrl = regenerateAndPersist(contract);
        Path persisted = toLocalPath(fileUrl);
        if (persisted != null) {
            try {
                Files.createDirectories(persisted.getParent());
                Files.write(persisted, pdf);
            } catch (Exception ex) {
                log.warn("Could not persist regenerated contract PDF for {}", contractId, ex);
            }
        }

        return pdf;
    }

    private byte[] renderPdfBytes(Contract contract) {
        String type = contract.getContractType() == null ? "" : contract.getContractType().toUpperCase();
        return switch (type) {
            case "SELLER_AGREEMENT" -> renderSellerBytes(contract);
            case "LISTING" -> renderListingBytes(contract);
            case "PURCHASE_AGREEMENT" -> renderPurchaseBytes(contract);
            default -> new byte[0];
        };
    }

    private byte[] renderSellerBytes(Contract contract) {
        Long userId = contract.getReferenceId();
        User user = userId != null
                ? userRepository.findById(Math.toIntExact(userId)).orElse(null)
                : null;
        String name = user != null ? displayName(user) : "—";
        String email = user != null ? user.getEmail() : "—";
        LocalDateTime signedAt = contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now();
        return sellerContractPdfService.renderSignedPdf(userId, name, email, signedAt);
    }

    private byte[] renderListingBytes(Contract contract) {
        Long productId = contract.getReferenceId();
        Product product = productId != null
                ? productRepository.findById(productId).orElse(null)
                : null;
        if (product == null) {
            return new byte[0];
        }
        User seller = product.getSellerId() != null
                ? userRepository.findById(Math.toIntExact(product.getSellerId())).orElse(null)
                : null;
        return listingContractPdfService.renderPdf(
                productId,
                product.getProductName(),
                seller != null ? displayName(seller) : "—",
                product.getStartingPrice(),
                contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now());
    }

    private byte[] renderPurchaseBytes(Contract contract) {
        Long auctionId = contract.getReferenceId();
        Auction auction = auctionId != null ? auctionRepository.findById(auctionId).orElse(null) : null;
        User buyer = auction != null ? loadWinnerForAuction(auction) : null;
        if (auction == null || buyer == null) {
            return new byte[0];
        }

        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        Product product = auctionId != null ? loadProductForAuction(auctionId) : null;
        Long sellerId = product != null ? product.getSellerId() : null;
        User seller = sellerId != null
                ? userRepository.findById(Math.toIntExact(sellerId)).orElse(null)
                : null;

        boolean platformListing = seller != null && seller.getRole() != null
                && "Admin".equalsIgnoreCase(seller.getRole().getRoleName());
        String sellerName = platformListing
                ? "CÔNG TY LUXEAUCTION"
                : (seller != null ? displayName(seller) : "—");
        String sellerEmail = platformListing
                ? (admin != null ? admin.getEmail() : "admin@luxeauction.vn")
                : (seller != null ? seller.getEmail() : "—");

        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;
        LocalDateTime signedAt = contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now();

        PurchaseContractPdfService.PurchaseContractData data =
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
                        signedAt);

        return purchaseContractPdfService.renderPdf(data);
    }

    private String regenerateAndPersist(Contract contract) {
        String type = contract.getContractType() == null ? "" : contract.getContractType().toUpperCase();
        String fileUrl = switch (type) {
            case "SELLER_AGREEMENT" -> regenerateSeller(contract);
            case "LISTING" -> regenerateListing(contract);
            case "PURCHASE_AGREEMENT" -> regeneratePurchase(contract);
            default -> contract.getFileUrl();
        };

        if (fileUrl != null && !fileUrl.equals(contract.getFileUrl())) {
            contract.setFileUrl(fileUrl);
            contractRepository.save(contract);
        }
        return fileUrl;
    }

    private String regenerateSeller(Contract contract) {
        Long userId = contract.getReferenceId();
        User user = userId != null
                ? userRepository.findById(Math.toIntExact(userId)).orElse(null)
                : null;
        String name = user != null ? displayName(user) : "—";
        String email = user != null ? user.getEmail() : "—";
        LocalDateTime signedAt = contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now();
        return sellerContractPdfService.generateAndStore(userId, name, email, signedAt);
    }

    private String regenerateListing(Contract contract) {
        Long productId = contract.getReferenceId();
        Product product = productId != null
                ? productRepository.findById(productId).orElse(null)
                : null;
        if (product == null) {
            return contract.getFileUrl();
        }
        User seller = product.getSellerId() != null
                ? userRepository.findById(Math.toIntExact(product.getSellerId())).orElse(null)
                : null;
        return listingContractPdfService.generateAndStore(
                productId,
                product.getProductName(),
                seller != null ? displayName(seller) : "—",
                product.getStartingPrice(),
                contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now());
    }

    private String regeneratePurchase(Contract contract) {
        Long auctionId = contract.getReferenceId();
        Auction auction = auctionId != null ? auctionRepository.findById(auctionId).orElse(null) : null;
        User buyer = auction != null ? loadWinnerForAuction(auction) : null;
        if (auction == null || buyer == null) {
            return contract.getFileUrl();
        }

        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        Product product = auctionId != null ? loadProductForAuction(auctionId) : null;
        Long sellerId = product != null ? product.getSellerId() : null;
        User seller = sellerId != null
                ? userRepository.findById(Math.toIntExact(sellerId)).orElse(null)
                : null;

        boolean platformListing = seller != null && seller.getRole() != null
                && "Admin".equalsIgnoreCase(seller.getRole().getRoleName());
        String sellerName = platformListing
                ? "CÔNG TY LUXEAUCTION"
                : (seller != null ? displayName(seller) : "—");
        String sellerEmail = platformListing
                ? (admin != null ? admin.getEmail() : "admin@luxeauction.vn")
                : (seller != null ? seller.getEmail() : "—");

        long finalPrice = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0L;
        LocalDateTime signedAt = contract.getCreatedAt() != null ? contract.getCreatedAt() : LocalDateTime.now();

        PurchaseContractPdfService.PurchaseContractData data =
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
                        signedAt);

        return purchaseContractPdfService.generateAndStore(data);
    }

    private Product loadProductForAuction(Long auctionId) {
        return auctionSessionRepository.findById(auctionId)
                .map(AuctionSession::getProductId)
                .flatMap(productRepository::findById)
                .orElse(null);
    }

    private User loadWinnerForAuction(Auction auction) {
        Long winnerId = auctionSessionRepository.findById(auction.getAuctionId())
                .map(AuctionSession::getCurrentWinnerUserId)
                .orElse(null);
        if (winnerId == null) {
            User lazyWinner = auction.getCurrentWinnerUser();
            winnerId = lazyWinner != null ? lazyWinner.getUserId() : null;
        }
        if (winnerId == null) {
            return null;
        }
        return userRepository.findById(Math.toIntExact(winnerId)).orElse(null);
    }

    private Path toLocalPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }
        String normalized = fileUrl.trim();
        if (normalized.startsWith("/uploads/")) {
            normalized = normalized.substring("/uploads/".length());
        } else if (normalized.startsWith("uploads/")) {
            normalized = normalized.substring("uploads/".length());
        } else {
            return null;
        }
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(normalized);
    }

    private String displayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            name = user.getEmail();
        }
        return name == null ? "#" + user.getUserId() : name;
    }
}
