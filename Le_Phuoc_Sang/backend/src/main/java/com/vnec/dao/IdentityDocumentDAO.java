package com.vnec.dao;

import com.vnec.model.IdentityDocument;
import com.vnec.util.JpaUtil;
import jakarta.persistence.EntityManager;

public class IdentityDocumentDAO {
    public void save(IdentityDocument document) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(document);
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

    public IdentityDocument findLatestByUserId(long userId) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            return em.createQuery(
                            "SELECT d FROM IdentityDocument d WHERE d.user.id = :userId ORDER BY d.createdAt DESC",
                            IdentityDocument.class)
                    .setParameter("userId", userId)
                    .setMaxResults(1)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            if (em.isOpen()) {
                em.close();
            }
        }
    }
}