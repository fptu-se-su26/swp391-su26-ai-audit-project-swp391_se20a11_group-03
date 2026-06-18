package com.auction.chat.repository;

import com.auction.chat.entity.Conversation;
import com.auction.chat.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser_IdOrderByUpdatedAtDesc(Integer userId);

    List<Conversation> findByAssignedStaff_IdOrderByUpdatedAtDesc(Integer staffId);

    List<Conversation> findByAssignedStaffIsNullAndStatusNotOrderByCreatedAtAsc(ConversationStatus status);

    /**
     * Buyer ↔ Seller: tìm cuộc hội thoại đang mở giữa buyer và seller (cho cùng 1 sản phẩm nếu có).
     * Tránh tạo trùng conversation khi 2 bên đã nhắn với nhau.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.type = com.auction.chat.enums.ConversationType.BUYER_SELLER
          AND c.user.id = :buyerId
          AND c.seller.id = :sellerId
          AND (:productId IS NULL OR c.product.productId = :productId)
          AND c.status <> com.auction.chat.enums.ConversationStatus.CLOSED
        ORDER BY c.updatedAt DESC
    """)
    List<Conversation> findActiveBuyerSeller(
            @Param("buyerId") Integer buyerId,
            @Param("sellerId") Integer sellerId,
            @Param("productId") Long productId);

    /**
     * Tìm conversation staff-support đang mở của user.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.user.id = :userId
          AND c.type <> com.auction.chat.enums.ConversationType.BUYER_SELLER
          AND c.status <> com.auction.chat.enums.ConversationStatus.CLOSED
        ORDER BY c.updatedAt DESC
    """)
    List<Conversation> findActiveSupportByUser(@Param("userId") Integer userId);

    /**
     * Admin overview: tất cả conversations.
     */
    List<Conversation> findAllByOrderByUpdatedAtDesc();

    /**
     * Admin: tất cả conversation BUYER_SELLER (để giám sát giao dịch buyer ↔ seller).
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.type = com.auction.chat.enums.ConversationType.BUYER_SELLER
        ORDER BY c.updatedAt DESC
    """)
    List<Conversation> findAllBuyerSellerConversations();
}