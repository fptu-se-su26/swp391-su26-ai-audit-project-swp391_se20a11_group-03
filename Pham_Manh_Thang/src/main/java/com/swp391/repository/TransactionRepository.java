package com.swp391.repository;

import com.swp391.dto.dashboard.DashboardSummaryDTO;
import com.swp391.dto.dashboard.TransactionReportItemDTO;
import com.swp391.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    boolean existsByTransactionType(String transactionType);

    @Query("""
        select new com.swp391.dto.dashboard.DashboardSummaryDTO(
            coalesce(sum(case
                when t.status = 'COMPLETED' and t.transactionType = 'PAY_AUCTION'
                then t.amount else 0 end), 0),
            count(t),
            coalesce(sum(case when t.status = 'COMPLETED' then 1 else 0 end), 0),
            coalesce(sum(case when t.status = 'FAILED' then 1 else 0 end), 0)
        )
        from Transaction t
        where (:fromDate is null or t.createdAt >= :fromDate)
          and (:toDate is null or t.createdAt <= :toDate)
        """)
    DashboardSummaryDTO getDashboardSummary(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query(value = """
        SELECT CAST(t.CreatedAt AS DATE) AS transactionDate,
               SUM(t.Amount) AS revenue
        FROM Transactions t
        WHERE t.Status = 'COMPLETED'
          AND t.TransactionType = 'PAY_AUCTION'
          AND (:fromDate IS NULL OR t.CreatedAt >= :fromDate)
          AND (:toDate IS NULL OR t.CreatedAt <= :toDate)
        GROUP BY CAST(t.CreatedAt AS DATE)
        ORDER BY transactionDate ASC
        """, nativeQuery = true)
    List<Object[]> findRevenueGroupedByDate(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query("""
        select new com.swp391.dto.dashboard.TransactionReportItemDTO(
            t.transactionId,
            coalesce(u.username, 'N/A'),
            t.amount,
            t.transactionType,
            t.status,
            t.createdAt
        )
        from Transaction t
        left join t.wallet w
        left join w.user u
        where (:fromDate is null or t.createdAt >= :fromDate)
          and (:toDate is null or t.createdAt <= :toDate)
        order by t.createdAt desc
        """)
    Page<TransactionReportItemDTO> findTransactionReportItems(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    @Query("""
        select new com.swp391.dto.dashboard.TransactionReportItemDTO(
            t.transactionId,
            coalesce(u.username, 'N/A'),
            t.amount,
            t.transactionType,
            t.status,
            t.createdAt
        )
        from Transaction t
        left join t.wallet w
        left join w.user u
        where (:fromDate is null or t.createdAt >= :fromDate)
          and (:toDate is null or t.createdAt <= :toDate)
        order by t.createdAt desc
        """)
    List<TransactionReportItemDTO> findTransactionReportItemsForExport(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
