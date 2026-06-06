package com.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId", nullable = false)
    private Role role;

    @Column(name = "Username", unique = true, length = 100)
    private String username;

    @Column(name = "Email", unique = true, length = 255)
    private String email;

    @Column(name = "PasswordHash")
    private byte[] passwordHash;

    @Column(name = "PasswordSalt")
    private byte[] passwordSalt;

    @Column(name = "AuthProvider", nullable = false, length = 30)
    private String authProvider;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
