package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

