package com.auction.account.dao;

import com.auction.account.model.UserVerificationToken;
import com.auction.account.util.JpaUtil;
import jakarta.persistence.EntityManager;

import java.time.LocalDateTime;

public class UserVerificationTokenDAO {
    public void save(UserVerificationToken token) {
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

    public UserVerificationToken findByHashAndType(String tokenHash, String tokenType) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            return em.createQuery(
                            "SELECT t FROM UserVerificationToken t WHERE t.tokenHash = :tokenHash AND t.tokenType = :tokenType",
                            UserVerificationToken.class)
                    .setParameter("tokenHash", tokenHash)
                    .setParameter("tokenType", tokenType)
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
            UserVerificationToken token = em.find(UserVerificationToken.class, id);
            if (token != null) {
                token.setUsedAt(usedAt);
            }
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


