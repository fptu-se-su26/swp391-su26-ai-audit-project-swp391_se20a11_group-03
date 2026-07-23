package com.auction.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/favicon.ico", "/css/**", "/js/**", "/images/**", "/assets/**", "/webjars/**", "/uploads/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/public/**", "/ws/**", "/api/alive", "/api/wallet/sepay-webhook").permitAll()
                .requestMatchers("/api/wallet", "/api/wallet/deposit", "/api/wallet/withdraw").authenticated()
                .requestMatchers("/api/wallets/user/**").hasAnyRole("Staff", "Admin")
                .requestMatchers("/api/staff/withdrawals/**").hasAnyRole("Staff", "Admin")
                .requestMatchers("/api/staff/orders/**", "/api/staff/shippers").hasAnyRole("Staff", "Admin")
                .requestMatchers("/api/shipper/orders/**").hasRole("Shipper")
                .requestMatchers("/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/watchlist/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auctions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/featured-products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers("/api/seller/events/**").hasRole("Seller")
                .requestMatchers("/api/admin/users/**").hasRole("Admin")
                .requestMatchers("/api/admin/events/**").hasRole("Admin")
                .requestMatchers("/api/admin/settings/**", "/api/admin/fraud-alerts/**").hasRole("Admin")
                .requestMatchers("/api/admin/dashboard/**").hasAnyRole("Admin", "Staff")
                .requestMatchers(HttpMethod.GET, "/api/admin/products/**").hasAnyRole("Staff", "Admin")
                .requestMatchers(HttpMethod.GET, "/api/admin/categories/**").hasRole("Admin")
                .requestMatchers(HttpMethod.POST, "/api/admin/categories/**").hasRole("Admin")
                .requestMatchers(HttpMethod.PUT, "/api/admin/categories/**").hasRole("Admin")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/categories/**").hasRole("Admin")
                .requestMatchers("/api/admin/featured-products/**").hasRole("Admin")
                .requestMatchers(HttpMethod.POST, "/api/admin/products/*/approve", "/api/admin/products/*/reject")
                    .hasAnyRole("Staff", "Admin")
                .requestMatchers("/api/kyc/list", "/api/kyc/*/approve", "/api/kyc/*/reject", "/api/kyc/*/request-info")
                    .hasAnyRole("Staff", "Admin")
                .requestMatchers(HttpMethod.POST, "/api/auctions/*/bid").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/auctions/*/pay").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/auctions/*/deposit").authenticated()
                // Legacy/non-/api admin & staff endpoints (e.g. Thymeleaf panels and
                // dual-mapped controllers) must NOT fall through to plain
                // "authenticated" — that let any logged-in user approve/reject products
                // or manage categories by dropping the /api prefix. Order matters:
                // the Staff-allowed product path is matched before the Admin-only /admin/**.
                .requestMatchers("/staff/**").hasAnyRole("Staff", "Admin")
                .requestMatchers("/admin/products/**").hasAnyRole("Staff", "Admin")
                .requestMatchers("/admin/**").hasRole("Admin")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
