package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId", nullable = false)
    private Role role;

    @Column(name = "Username", unique = true)
    private String username;

    @Column(name = "Email", unique = true)
    private String email;

    @Column(name = "PasswordHash")
    private byte[] passwordHash;

    @Column(name = "PasswordSalt")
    private byte[] passwordSalt;

    @Column(name = "AuthProvider", nullable = false)
    private String authProvider;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}

