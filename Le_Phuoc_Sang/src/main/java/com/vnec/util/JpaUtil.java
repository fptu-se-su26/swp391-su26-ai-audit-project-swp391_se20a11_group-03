package com.vnec.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public final class JpaUtil {
    private static volatile EntityManagerFactory entityManagerFactory;

    private JpaUtil() {
    }

    private static EntityManagerFactory getEntityManagerFactory() {
        EntityManagerFactory current = entityManagerFactory;
        if (current == null || !current.isOpen()) {
            synchronized (JpaUtil.class) {
                current = entityManagerFactory;
                if (current == null || !current.isOpen()) {
                    entityManagerFactory = current = buildFactory();
                }
            }
        }
        return current;
    }

    private static EntityManagerFactory buildFactory() {
        try {
            return Persistence.createEntityManagerFactory(
                    AppConfig.get("vnec.persistence.unit", "vnec-auth-pu")
            );
        } catch (RuntimeException ex) {
            throw new IllegalStateException(
                    "Không thể khởi tạo JPA EntityManagerFactory. Kiểm tra SQL Server, database VNEC_Auth, user/password và persistence.xml.",
                    ex
            );
        }
    }

    public static EntityManager createEntityManager() {
        return getEntityManagerFactory().createEntityManager();
    }

    public static void close() {
        EntityManagerFactory current = entityManagerFactory;
        if (current != null && current.isOpen()) {
            current.close();
        }
    }
}
