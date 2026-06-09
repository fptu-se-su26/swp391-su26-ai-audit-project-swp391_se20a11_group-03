package org.example.backend.repository;

import org.example.backend.entity.Conversation;
import org.example.backend.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser_UserIdOrderByUpdatedAtDesc(Long userId);

    List<Conversation> findByAssignedStaff_UserIdOrderByUpdatedAtDesc(Long staffId);

    List<Conversation> findByAssignedStaffIsNullAndStatusNotOrderByCreatedAtAsc(ConversationStatus status);
}

