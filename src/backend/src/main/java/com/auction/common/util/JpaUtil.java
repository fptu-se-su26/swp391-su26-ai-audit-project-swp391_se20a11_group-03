package com.auction.common.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.stereotype.Component;

@Component
public final class JpaUtil {
    private static volatile EntityManagerFactory entityManagerFactory;

    public JpaUtil(EntityManagerFactory entityManagerFactory) {
        JpaUtil.entityManagerFactory = entityManagerFactory;
    }

    public static EntityManager createEntityManager() {
        EntityManagerFactory factory = entityManagerFactory;
        if (factory == null) {
            throw new IllegalStateException("Spring EntityManagerFactory has not been initialized");
        }
        return factory.createEntityManager();
    }
}
