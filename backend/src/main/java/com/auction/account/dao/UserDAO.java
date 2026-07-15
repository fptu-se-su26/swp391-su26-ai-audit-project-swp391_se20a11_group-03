package com.auction.account.dao;

import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.common.util.JpaUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {
    public boolean existsByEmail(String email) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery("SELECT COUNT(u) FROM User u WHERE LOWER(u.email) = LOWER(:email)", Long.class);
            query.setParameter("email", email);
            return query.getSingleResult() > 0;
        } finally {
            closeQuietly(em);
        }
    }

    public boolean existsByPhone(String phone) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery("SELECT COUNT(u) FROM User u WHERE u.phone = :phone", Long.class);
            query.setParameter("phone", phone);
            return query.getSingleResult() > 0;
        } finally {
            closeQuietly(em);
        }
    }

    public boolean existsByIdentityNumber(String identityNumber) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery("SELECT COUNT(u) FROM User u WHERE u.identityNumber = :identityNumber", Long.class);
            query.setParameter("identityNumber", identityNumber);
            return query.getSingleResult() > 0;
        } finally {
            closeQuietly(em);
        }
    }

    public boolean register(User user) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(user);
            em.getTransaction().commit();
            return true;
        } catch (RuntimeException ex) {
            rollbackQuietly(em);
            throw ex;
        } finally {
            closeQuietly(em);
        }
    }

    public Role findRoleByName(String roleName) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            TypedQuery<Role> query = em.createQuery(
                    "SELECT r FROM Role r WHERE r.roleName = :roleName",
                    Role.class
            );
            query.setParameter("roleName", roleName);
            return query.getResultStream().findFirst().orElse(null);
        } finally {
            closeQuietly(em);
        }
    }

    public User findById(int id) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            return em.find(User.class, id);
        } finally {
            closeQuietly(em);
        }
    }

    public User findByLoginId(String loginId) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            String normalizedLoginId = loginId == null ? null : loginId.trim();
            if (normalizedLoginId == null || normalizedLoginId.isEmpty()) {
                return null;
            }

            TypedQuery<User> emailQuery = em.createQuery(
                    "SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:loginId)",
                    User.class
            );
            emailQuery.setParameter("loginId", normalizedLoginId);
            User user = emailQuery.getResultStream().findFirst().orElse(null);
            if (user != null) {
                return user;
            }

            TypedQuery<User> phoneQuery = em.createQuery(
                    "SELECT u FROM User u WHERE u.phone = :loginId",
                    User.class
            );
            phoneQuery.setParameter("loginId", normalizedLoginId);
            user = phoneQuery.getResultStream().findFirst().orElse(null);
            if (user != null) {
                return user;
            }

            TypedQuery<User> identityQuery = em.createQuery(
                    "SELECT u FROM User u WHERE u.identityNumber = :loginId",
                    User.class
            );
            identityQuery.setParameter("loginId", normalizedLoginId);
            return identityQuery.getResultStream().findFirst().orElse(null);
        } finally {
            closeQuietly(em);
        }
    }

    public void update(User user) {
        EntityManager em = JpaUtil.createEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(user);
            em.getTransaction().commit();
        } catch (RuntimeException ex) {
            rollbackQuietly(em);
            throw ex;
        } finally {
            closeQuietly(em);
        }
    }

    private void rollbackQuietly(EntityManager em) {
        if (em.getTransaction().isActive()) {
            em.getTransaction().rollback();
        }
    }

    private void closeQuietly(EntityManager em) {
        if (em.isOpen()) {
            em.close();
        }
    }
}


