package com.vnec.dao;

import com.vnec.model.AuditLog;
import com.vnec.util.JpaUtil;
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