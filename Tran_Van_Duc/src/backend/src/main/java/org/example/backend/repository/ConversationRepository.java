package org.example.backend.repository;

import org.example.backend.entity.Conversation;
import org.example.backend.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser_UserIdOrderByUpdatedAtDesc(Long userId);

    /** Hội thoại hỗ trợ (con người) của người dùng, LOẠI TRỪ hội thoại với bot AI. */
    @Query("SELECT c FROM Conversation c WHERE c.user.userId = :userId "
            + "AND (c.assignedStaff IS NULL OR c.assignedStaff.username <> :botUsername) "
            + "ORDER BY c.updatedAt DESC")
    List<Conversation> findHumanConversationsByUser(@Param("userId") Long userId,
                                                    @Param("botUsername") String botUsername);

    List<Conversation> findByAssignedStaff_UserIdOrderByUpdatedAtDesc(Long staffId);

    List<Conversation> findByAssignedStaffIsNullAndStatusNotOrderByCreatedAtAsc(ConversationStatus status);
}
