package com.auction.bidding.repository;

import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaAuctionSessionRepository implements AuctionSessionRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public Optional<AuctionSession> findByIdForUpdate(Long auctionId) {
        return Optional.ofNullable(entityManager.find(AuctionSession.class, auctionId, LockModeType.PESSIMISTIC_WRITE));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuctionSession> findById(Long auctionId) {
        return Optional.ofNullable(entityManager.find(AuctionSession.class, auctionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionSession> findOpenRooms() {
        return entityManager.createQuery(
                        "SELECT a FROM AuctionSession a WHERE a.status IN :statuses",
                        AuctionSession.class)
                .setParameter("statuses", List.of(AuctionStatus.UPCOMING, AuctionStatus.ACTIVE))
                .getResultList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionSession> findByCurrentWinnerUserId(Integer userId) {
        return entityManager.createQuery(
                        "SELECT a FROM AuctionSession a WHERE a.currentWinnerUserId = :userId",
                        AuctionSession.class)
                .setParameter("userId", userId)
                .getResultList();
    }

    @Override
    @Transactional
    public AuctionSession save(AuctionSession auctionSession) {
        return entityManager.merge(auctionSession);
    }
}
