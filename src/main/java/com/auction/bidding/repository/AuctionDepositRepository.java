import com.auction.bidding.entity.AuctionDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AuctionDepositRepository extends JpaRepository<AuctionDeposit, Long> {
    Optional<AuctionDeposit> findByAuction_AuctionIdAndUser_Id(Long auctionId, Integer userId);
    List<AuctionDeposit> findByAuction_AuctionId(Long auctionId);
    List<AuctionDeposit> findByUser_Id(Integer userId);

    /** Sum of deposits still locked (not refunded / forfeited / applied to payment). */
    @Query("""
            SELECT COALESCE(SUM(d.depositAmount), 0)
            FROM AuctionDeposit d
            WHERE UPPER(d.status) IN :statuses
            """)
    long sumDepositAmountByStatusIn(@Param("statuses") Collection<String> statuses);
}

