package com.charity.security;

import com.charity.entity.AdminUser;
import com.charity.entity.User;
import com.charity.repository.AdminUserRepository;
import com.charity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService for loading admin users
 * FIX #2: Unified UserDetailsService.
 *
 * Previously there were two separate UserDetailsService beans
 * (AdminUserDetailsService + an implicit one for regular Users),
 * causing Spring to throw a NoUniqueBeanDefinitionException on startup.
 *
 * Strategy: try to load as a regular User first (lookup by email),
 * then fall back to AdminUser (lookup by username).
 * Both user types share the same JWT filter and SecurityConfig.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {

        // 1. Try regular User (identified by email)
        var optionalUser = userRepository.findByEmail(identifier);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .authorities(Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    ))
                    .accountExpired(false)
                    .accountLocked(!user.isApproved())   // locked until admin approves
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        }

        // 2. Fall back to AdminUser (identified by username)
        var optionalAdmin = adminUserRepository.findByUsername(identifier);
        if (optionalAdmin.isPresent()) {
            AdminUser admin = optionalAdmin.get();

            if (!admin.isActive()) {
                throw new UsernameNotFoundException("Admin account is disabled: " + identifier);
            }

            return org.springframework.security.core.userdetails.User.builder()
                    .username(admin.getUsername())
                    .password(admin.getPassword())
                    .authorities(Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())
                    ))
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(!admin.isActive())
                    .build();
        }

        log.warn("No user or admin found for identifier: {}", identifier);
        throw new UsernameNotFoundException("User not found: " + identifier);
    }
}
