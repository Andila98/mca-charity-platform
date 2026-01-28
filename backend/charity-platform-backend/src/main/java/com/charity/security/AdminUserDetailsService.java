package com.charity.security;

import com.charity.entity.AdminUser;
import com.charity.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService for loading admin users
 */
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Load admin user from database
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Admin user not found: " + username)
                );

        // Check if account is active
        if (!adminUser.isActive()) {
            throw new UsernameNotFoundException("Admin account is disabled: " + username);
        }

        // Convert to Spring Security UserDetails
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(adminUser.getUsername())
                .password(adminUser.getPassword())
                .authorities(Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + adminUser.getRole().name())
                ))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!adminUser.isActive())
                .build();
    }
}






