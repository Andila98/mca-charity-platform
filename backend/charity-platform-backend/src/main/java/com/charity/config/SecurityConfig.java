package com.charity.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * Password Encoder Bean
     * BCrypt is a strong hashing algorithm for passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Security Filter Chain
     * Configure HTTP security (authentication/authorization rules)
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with our configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF for testing (enable in production with proper setup)
                .csrf(csrf -> csrf.disable())

                // Configure authorization
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Allow all requests (FOR TESTING ONLY!)
                );

        return http.build();
    }

}
