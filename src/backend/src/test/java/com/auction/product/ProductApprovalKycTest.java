package com.auction.product;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.service.KycEligibilityService;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionCreationService;
import com.auction.common.exception.KycRequiredException;
import com.auction.notification.service.NotificationService;
import com.auction.product.dto.ProductApprovalRequestDTO;
import com.auction.product.entity.Product;
import com.auction.product.repository.CategoryAttributeRepository;
import com.auction.product.repository.CategoryRepository;
import com.auction.product.repository.ProductApprovalRepository;
import com.auction.product.repository.ProductAttributeValueRepository;
import com.auction.product.repository.ProductImageRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ContractService;
import com.auction.product.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductApprovalKycTest {

    @Mock ProductRepository productRepository;
    @Mock ProductApprovalRepository productApprovalRepository;
    @Mock ProductImageRepository productImageRepository;
    @Mock ProductAttributeValueRepository productAttributeValueRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock CategoryAttributeRepository categoryAttributeRepository;
    @Mock UserRepository userRepository;
    @Mock ContractService contractService;
    @Mock AuctionRepository auctionRepository;
    @Mock AuctionCreationService auctionCreationService;
    @Mock NotificationService notificationService;
    @Mock KycEligibilityService kycEligibilityService;

    @InjectMocks ProductServiceImpl productService;

    @Test
    void approveProduct_rejectsSellerWithoutCurrentlyApprovedKyc() {
        Product product = new Product();
        product.setProductId(10L);
        product.setSellerId(7L);
        product.setStatus("PENDING");

        User seller = new User();
        seller.setId(7);

        Role adminRole = new Role();
        adminRole.setRoleName("Admin");
        User reviewer = new User();
        reviewer.setId(99);
        reviewer.setRole(adminRole);

        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(userRepository.findById(99)).thenReturn(Optional.of(reviewer));
        when(userRepository.findById(7)).thenReturn(Optional.of(seller));
        doThrow(new KycRequiredException("KYC required"))
                .when(kycEligibilityService)
                .requireApproved(any(User.class), anyString());

        assertThrows(
                KycRequiredException.class,
                () -> productService.approveProduct(
                        10L,
                        new ProductApprovalRequestDTO(),
                        99L
                )
        );

        verify(productRepository, never()).save(any(Product.class));
        verify(auctionCreationService, never())
                .createForApprovedProduct(any(), any(), any(), any());
    }
}
