package com.auction.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.dao.UserRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@Configuration("chatDataSeeder")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final BCryptPasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
                               com.auction.account.dao.RoleRepository roleRepository) {
        return args -> {
            // Seed roles
            List<String> roleNames = List.of("Admin", "Staff", "Seller", "User");
            for (String name : roleNames) {
                if (roleRepository.findByRoleName(name).isEmpty()) {
                    roleRepository.save(new Role(null, name));
                    log.info("Created role: {}", name);
                }
            }

            // Seed admin user
            if (userRepository.findByEmail("admin@swp391.com").isEmpty()) {
                String hash = passwordEncoder.encode("Admin@123");
                User admin = new User("Admin", "admin@swp391.com", "0900000001", "ADMIN001", hash, "", 0);
                userRepository.save(admin);
                log.info("Created admin user (password: Admin@123)");
            }

            // Seed staff user
            if (userRepository.findByEmail("staff1@swp391.com").isEmpty()) {
                String hash = passwordEncoder.encode("Staff@123");
                User staff = new User("Staff 1", "staff1@swp391.com", "0900000002", "STAFF001", hash, "", 0);
                userRepository.save(staff);
                log.info("Created staff user (password: Staff@123)");
            }

            // Seed regular user
            if (userRepository.findByEmail("user1@swp391.com").isEmpty()) {
                String hash = passwordEncoder.encode("User@123");
                User user = new User("User 1", "user1@swp391.com", "0900000003", "USER001", hash, "", 0);
                userRepository.save(user);
                log.info("Created test user (password: User@123)");
            }
        };
    }
}

