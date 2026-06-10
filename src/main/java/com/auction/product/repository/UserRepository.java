package com.auction.product.repository;

import com.auction.product.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author Pham Manh Thang
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}

