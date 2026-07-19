package com.auction.fraud.repository;

import com.auction.fraud.entity.SystemSettingAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingAuditLogRepository extends JpaRepository<SystemSettingAuditLog, Long> {
}
