package com.auction.account.dao;

import com.auction.account.entity.PasswordResetToken;
import com.auction.common.util.JpaUtil;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public class PasswordResetTokenDAO {
    public void save(PasswordResetToken token) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(token);
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

    public PasswordResetToken findByHash(String tokenHash) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            return em.createQuery("SELECT t FROM PasswordResetToken t WHERE t.tokenHash = :tokenHash", PasswordResetToken.class)
                    .setParameter("tokenHash", tokenHash)
                    .getResultStream()
                    .findFirst()
                    .orElse(null);
        } finally {
            if (em.isOpen()) {
                em.close();
            }
        }
    }

    public void markUsed(long id, LocalDateTime usedAt) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            PasswordResetToken token = em.find(PasswordResetToken.class, id);
            if (token != null) token.setUsedAt(usedAt);
            em.getTransaction().commit();
        } catch (RuntimeException ex) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw ex;
        } finally {
            if (em.isOpen()) em.close();
        }
    }
}


