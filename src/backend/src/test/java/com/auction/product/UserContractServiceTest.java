package com.auction.product;

import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.product.repository.ContractRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ContractPdfAccessService;
import com.auction.product.service.UserContractService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserContractServiceTest {

    @Mock ContractRepository contractRepository;
    @Mock ProductRepository productRepository;
    @Mock AuctionRepository auctionRepository;
    @Mock AuctionSessionRepository auctionSessionRepository;
    @Mock ContractPdfAccessService contractPdfAccessService;

    @InjectMocks UserContractService userContractService;

    @Test
    void resolveOwnedPdf_allowsAuctionWinner() {
        Contract contract = contract(91L, "PURCHASE_AGREEMENT", 12L);
        User winner = new User();
        winner.setId(7);
        Product product = new Product();
        product.setSellerId(30L);
        Auction auction = new Auction();
        auction.setAuctionId(12L);
        auction.setProduct(product);
        auction.setCurrentWinnerUser(winner);
        byte[] expected = new byte[] { 1, 2, 3 };

        when(contractRepository.findById(91L)).thenReturn(Optional.of(contract));
        when(auctionRepository.findById(12L)).thenReturn(Optional.of(auction));
        when(auctionSessionRepository.findById(12L)).thenReturn(Optional.empty());
        when(contractPdfAccessService.resolvePdfBytes(91L)).thenReturn(expected);

        assertArrayEquals(expected, userContractService.resolveOwnedPdf(7L, 91L));
        verify(contractPdfAccessService).resolvePdfBytes(91L);
    }

    @Test
    void resolveOwnedPdf_rejectsUnrelatedUser() {
        Contract contract = contract(92L, "LISTING", 22L);
        Product product = new Product();
        product.setProductId(22L);
        product.setSellerId(30L);

        when(contractRepository.findById(92L)).thenReturn(Optional.of(contract));
        when(productRepository.findById(22L)).thenReturn(Optional.of(product));

        assertThrows(
                AccessDeniedException.class,
                () -> userContractService.resolveOwnedPdf(8L, 92L));
        verify(contractPdfAccessService, never()).resolvePdfBytes(92L);
    }

    private Contract contract(Long id, String type, Long referenceId) {
        Contract contract = new Contract();
        contract.setContractId(id);
        contract.setContractType(type);
        contract.setReferenceId(referenceId);
        contract.setFileUrl("/uploads/contracts/" + id + ".pdf");
        contract.setCreatedAt(LocalDateTime.now());
        return contract;
    }
}
