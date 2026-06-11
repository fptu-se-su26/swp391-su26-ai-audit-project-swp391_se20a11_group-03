package com.auction.chat.repository;

import com.auction.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversation_ConversationIdOrderBySentAtAsc(Long conversationId);

    Optional<Message> findTopByConversation_ConversationIdOrderBySentAtDesc(Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m " +
           "WHERE m.conversation.conversationId = :conversationId " +
           "AND m.isRead = false AND m.sender.id != :userId")
    int countUnread(@Param("conversationId") Long conversationId,
                    @Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true " +
           "WHERE m.conversation.conversationId = :conversationId " +
           "AND m.sender.id != :userId")
    void markAllAsRead(@Param("conversationId") Long conversationId,
                       @Param("userId") Integer userId);
}

