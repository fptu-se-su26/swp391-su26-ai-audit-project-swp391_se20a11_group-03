package com.auction.common.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JpaUtilTest {

    @Test
    void createsEntityManagerFromSpringManagedFactory() {
        EntityManagerFactory factory = mock(EntityManagerFactory.class);
        EntityManager entityManager = mock(EntityManager.class);
        when(factory.createEntityManager()).thenReturn(entityManager);

        new JpaUtil(factory);

        assertSame(entityManager, JpaUtil.createEntityManager());
        verify(factory).createEntityManager();
    }
}
