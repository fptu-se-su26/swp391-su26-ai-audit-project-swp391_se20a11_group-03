package com.auction.product.repository;

import com.auction.product.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Integer> {
    
    @Query("SELECT w FROM Watchlist w WHERE w.user.id = :userId ORDER BY w.createdAt DESC")
    List<Watchlist> findByUserId(@Param("userId") Integer userId);
    
    @Modifying
    @Query("DELETE FROM Watchlist w WHERE w.user.id = :userId AND w.product.productId = :productId")
    void removeFromWatchlist(@Param("userId") Integer userId, @Param("productId") Long productId);

    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Watchlist w WHERE w.user.id = :userId AND w.product.productId = :productId")
    boolean existsByUserAndProduct(@Param("userId") Integer userId, @Param("productId") Long productId);
}
