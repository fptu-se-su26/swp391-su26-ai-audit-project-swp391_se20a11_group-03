package com.auction.account.dao;

import com.auction.account.model.AuditLog;
import com.auction.account.util.JpaUtil;
import jakarta.persistence.EntityManager;

public class AuditLogDAO {
    public void save(AuditLog auditLog) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(auditLog);
            em.getTransaction().commit();
        } catch (RuntimeException ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            if (em.isOpen()) {
                em.close();
            }
        }
    }
}


