package com.auction.bidding;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.impl.AuctionPaymentServiceImpl;
import com.auction.order.dto.ShippingAddressRequest;
import com.auction.product.service.ContractService;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AuctionPaymentDeadlineTest {

    @Test
    void paymentIsRejectedImmediatelyAfterDeadlineWithoutWaitingForScheduler() {
        AuctionRepository auctionRepository = mock(AuctionRepository.class);
        AuctionDepositRepository depositRepository = mock(AuctionDepositRepository.class);
        WalletRepository walletRepository = mock(WalletRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ContractService contractService = mock(ContractService.class);
        AuctionPaymentServiceImpl service = new AuctionPaymentServiceImpl(
                auctionRepository,
                depositRepository,
                walletRepository,
                transactionRepository,
                userRepository,
                contractService,
                null,
                null);

        User winner = new User();
        winner.setId(99);
        Auction auction = new Auction();
        auction.setAuctionId(7L);
        auction.setCurrentWinnerUser(winner);
        auction.setEndTime(LocalDateTime.now().minusHours(72).minusMinutes(1));
        auction.setPaymentDeadline(LocalDateTime.now().minusSeconds(1));
        auction.setStatus("AWAITING_PAYMENT");
        auction.setPaymentStatus("AWAITING_PAYMENT");

        when(auctionRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(auction));
        when(contractService.hasPurchaseContract(7L)).thenReturn(true);

        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> service.payAuction(7L, 99L, new ShippingAddressRequest()));

        assertEquals("Payment window has expired for this auction", error.getMessage());
        verifyNoInteractions(walletRepository);
    }
}
