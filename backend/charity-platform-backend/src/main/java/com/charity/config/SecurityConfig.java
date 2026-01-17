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
                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/v1/projects",
                                "/api/v1/projects/**",
                                "/api/v1/events",
                                "/api/v1/events/**",
                                "/api/v1/volunteers/register",
                                "/api/v1/donations",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"error\": \"Unauthorized\", \"message\": \""
                                            + authException.getMessage() + "\"}"
                            );
                        })
                );

        return http.build();
    }

}
