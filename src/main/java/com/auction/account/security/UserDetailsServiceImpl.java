package com.auction.account.security;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        if (login == null || login.isBlank()) {
            throw new UsernameNotFoundException("Login identifier is blank");
        }
        if (login.contains("@")) {
            return userRepository.findByEmail(login)
                    .map(UserDetailsImpl::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));
        }
        return userRepository.findFirstByUsernameIgnoreCase(login)
                .or(() -> userRepository.findByUsernameOrEmail(login, login))
                .map(UserDetailsImpl::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));
    }
}

