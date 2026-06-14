package org.example.backend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final BCryptPasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
                               org.example.backend.repository.RoleRepository roleRepository) {
        return args -> {
            // Seed roles
            List<String> roleNames = List.of("Admin", "Staff", "Seller", "User");
            for (String name : roleNames) {
                if (roleRepository.findByRoleName(name).isEmpty()) {
                    roleRepository.save(Role.builder().roleName(name).build());
                    log.info("Created role: {}", name);
                }
            }

            // Seed admin user
            if (userRepository.findByUsername("admin").isEmpty()) {
                Role adminRole = roleRepository.findByRoleName("Admin")
                        .orElseThrow();
                String hash = passwordEncoder.encode("Admin@123");
                User admin = User.builder()
                        .username("admin")
                        .email("admin@swp391.com")
                        .passwordHash(hash.getBytes(StandardCharsets.UTF_8))
                        .passwordSalt(new byte[0])
                        .role(adminRole)
                        .status("ACTIVE")
                        .authProvider("LOCAL")
                        .build();
                userRepository.save(admin);
                log.info("Created admin user (password: Admin@123)");
            }

            // Seed staff user
            if (userRepository.findByUsername("staff1").isEmpty()) {
                Role staffRole = roleRepository.findByRoleName("Staff")
                        .orElseThrow();
                String hash = passwordEncoder.encode("Staff@123");
                User staff = User.builder()
                        .username("staff1")
                        .email("staff1@swp391.com")
                        .passwordHash(hash.getBytes(StandardCharsets.UTF_8))
                        .passwordSalt(new byte[0])
                        .role(staffRole)
                        .status("ACTIVE")
                        .authProvider("LOCAL")
                        .build();
                userRepository.save(staff);
                log.info("Created staff user (password: Staff@123)");
            }

            // Seed seller user
            if (userRepository.findByUsername("seller1").isEmpty()) {
                Role sellerRole = roleRepository.findByRoleName("Seller")
                        .orElseThrow();
                String hash = passwordEncoder.encode("Seller@123");
                User seller = User.builder()
                        .username("seller1")
                        .email("seller1@swp391.com")
                        .passwordHash(hash.getBytes(StandardCharsets.UTF_8))
                        .passwordSalt(new byte[0])
                        .role(sellerRole)
                        .status("ACTIVE")
                        .authProvider("LOCAL")
                        .build();
                userRepository.save(seller);
                log.info("Created seller user (password: Seller@123)");
            }

            // Seed AI bot user (đại diện cho chatbot trong bảng Messages)
            if (userRepository.findByUsername(org.example.backend.ai.AiConstants.BOT_USERNAME).isEmpty()) {
                Role userRole = roleRepository.findByRoleName("User")
                        .orElseThrow();
                User bot = User.builder()
                        .username(org.example.backend.ai.AiConstants.BOT_USERNAME)
                        .email("ai-bot@swp391.com")
                        .passwordHash(new byte[0])
                        .passwordSalt(new byte[0])
                        .role(userRole)
                        .status("ACTIVE")
                        .authProvider("LOCAL")
                        .build();
                userRepository.save(bot);
                log.info("Created AI bot user: {}", org.example.backend.ai.AiConstants.BOT_USERNAME);
            }

            // Seed regular user
            if (userRepository.findByUsername("user1").isEmpty()) {
                Role userRole = roleRepository.findByRoleName("User")
                        .orElseThrow();
                String hash = passwordEncoder.encode("User@123");
                User user = User.builder()
                        .username("user1")
                        .email("user1@swp391.com")
                        .passwordHash(hash.getBytes(StandardCharsets.UTF_8))
                        .passwordSalt(new byte[0])
                        .role(userRole)
                        .status("ACTIVE")
                        .authProvider("LOCAL")
                        .build();
                userRepository.save(user);
                log.info("Created test user (password: User@123)");
            }
        };
    }
}
