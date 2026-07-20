package com.auction.product.service;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.dto.UserContractDTO;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.product.repository.ContractRepository;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserContractService {

    private static final String SELLER_AGREEMENT = "SELLER_AGREEMENT";
    private static final String LISTING = "LISTING";
    private static final String PURCHASE_AGREEMENT = "PURCHASE_AGREEMENT";

    private final ContractRepository contractRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final ContractPdfAccessService contractPdfAccessService;

    @Transactional(readOnly = true)
    public List<UserContractDTO> findMyContracts(Long userId) {
        Map<Long, UserContractDTO> contracts = new LinkedHashMap<>();

        contractRepository.findByContractTypeAndReferenceId(SELLER_AGREEMENT, userId)
                .ifPresent(contract -> contracts.put(
                        contract.getContractId(),
                        toDto(contract, "ACCOUNT_HOLDER", "Hợp đồng nền tảng người bán")));

        List<Product> sellerProducts = productRepository.findBySellerId(userId);
        Map<Long, Product> productsById = sellerProducts.stream()
                .collect(java.util.stream.Collectors.toMap(Product::getProductId, product -> product));
        List<Long> productIds = new ArrayList<>(productsById.keySet());

        if (!productIds.isEmpty()) {
            contractRepository.findByContractTypeAndReferenceIdIn(LISTING, productIds)
                    .forEach(contract -> {
                        Product product = productsById.get(contract.getReferenceId());
                        contracts.put(contract.getContractId(), toDto(
                                contract,
                                "SELLER",
                                product != null ? product.getProductName() : "Sản phẩm #" + contract.getReferenceId()));
                    });
        }

        Map<Long, Auction> relatedAuctions = new LinkedHashMap<>();
        if (!productIds.isEmpty()) {
            auctionRepository.findByProduct_ProductIdIn(productIds)
                    .forEach(auction -> relatedAuctions.put(auction.getAuctionId(), auction));
        }
        auctionRepository.findByCurrentWinnerUser_Id(Math.toIntExact(userId))
                .forEach(auction -> relatedAuctions.put(auction.getAuctionId(), auction));

        if (!relatedAuctions.isEmpty()) {
            contractRepository.findByContractTypeAndReferenceIdIn(
                            PURCHASE_AGREEMENT,
                            relatedAuctions.keySet())
                    .forEach(contract -> {
                        Auction auction = relatedAuctions.get(contract.getReferenceId());
                        boolean buyer = auction != null && isWinner(auction, userId);
                        Product product = auction != null ? auction.getProduct() : null;
                        String productName = product != null
                                ? product.getProductName()
                                : "Phiên đấu giá #" + contract.getReferenceId();
                        contracts.put(contract.getContractId(), toDto(
                                contract,
                                buyer ? "BUYER" : "SELLER",
                                productName));
                    });
        }

        return contracts.values().stream()
                .sorted(Comparator.comparing(
                        UserContractDTO::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public byte[] resolveOwnedPdf(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));

        // Security edge cases handled here: guessed IDs, deleted references and
        // auction contracts requested by a user who is neither buyer nor seller.
        if (!belongsToUser(contract, userId)) {
            throw new AccessDeniedException("Bạn không có quyền xem hợp đồng này.");
        }
        return contractPdfAccessService.resolvePdfBytes(contractId);
    }

    private boolean belongsToUser(Contract contract, Long userId) {
        String type = contract.getContractType() == null ? "" : contract.getContractType().toUpperCase();
        return switch (type) {
            case SELLER_AGREEMENT -> userId.equals(contract.getReferenceId());
            case LISTING -> productRepository.findById(contract.getReferenceId())
                    .map(Product::getSellerId)
                    .filter(userId::equals)
                    .isPresent();
            case PURCHASE_AGREEMENT -> auctionRepository.findById(contract.getReferenceId())
                    .map(auction -> isWinner(auction, userId) || isSeller(auction, userId))
                    .orElse(false);
            default -> false;
        };
    }

    private boolean isWinner(Auction auction, Long userId) {
        Long winnerId = auctionSessionRepository.findById(auction.getAuctionId())
                .map(AuctionSession::getCurrentWinnerUserId)
                .orElse(null);
        if (winnerId == null && auction.getCurrentWinnerUser() != null) {
            winnerId = auction.getCurrentWinnerUser().getUserId();
        }
        return userId.equals(winnerId);
    }

    private boolean isSeller(Auction auction, Long userId) {
        Product product = auction.getProduct();
        return product != null && userId.equals(product.getSellerId());
    }

    private UserContractDTO toDto(
            Contract contract,
            String partyRole,
            String referenceName) {
        return UserContractDTO.builder()
                .contractId(contract.getContractId())
                .contractType(contract.getContractType())
                .referenceId(contract.getReferenceId())
                .referenceName(referenceName)
                .partyRole(partyRole)
                .createdAt(contract.getCreatedAt())
                .build();
    }
}
