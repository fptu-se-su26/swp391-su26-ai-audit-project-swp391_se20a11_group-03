package com.auction.chat.repository;

import com.auction.chat.entity.Conversation;
import com.auction.chat.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser_IdOrderByUpdatedAtDesc(Integer userId);

    List<Conversation> findByAssignedStaff_IdOrderByUpdatedAtDesc(Integer staffId);

    List<Conversation> findByAssignedStaffIsNullAndStatusNotOrderByCreatedAtAsc(ConversationStatus status);
}

