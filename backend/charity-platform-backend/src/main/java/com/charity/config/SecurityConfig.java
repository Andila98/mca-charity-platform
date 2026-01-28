package com.charity.config;

import com.charity.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    /**
     * Password Encoder Bean
     * BCrypt is a strong hashing algorithm for passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Provider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Security Filter Chain with proper authentication and authorization
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with our configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF (using JWT tokens, not session cookies)
                .csrf(csrf -> csrf.disable())

                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // ===== PUBLIC ENDPOINTS =====

                        // Authentication endpoints (login, register)
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Public read access to content
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/events/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/donations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/volunteers/**").permitAll()

                        // Public content/image endpoints (for frontend)
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/content/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/images/**").permitAll()

                        // Allow volunteer registration
                        .requestMatchers(HttpMethod.POST, "/api/v1/volunteers").permitAll()

                        // Allow donation submissions
                        .requestMatchers(HttpMethod.POST, "/api/v1/donations").permitAll()

                        // Swagger/OpenAPI documentation
                        // Swagger/OpenAPI documentation (with and without /api prefix)
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/v3/api-docs/**", "/api/swagger-ui/**", "/api/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-resources/**", "/webjars/**").permitAll()

                        // Static resources
                        .requestMatchers("/uploads/**").permitAll()

                        // ===== ADMIN ENDPOINTS =====

                        // Admin authentication
                        .requestMatchers("/api/v1/admin/auth/**").permitAll()

                        // Admin content management (requires authentication)
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/content/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/content/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/content/**").hasRole("ADMIN")

                        // Admin image management (requires authentication)
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/images/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/images/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/images/**").hasRole("ADMIN")

                        // ===== AUTHENTICATED ENDPOINTS =====

                        // User management
                        .requestMatchers("/api/v1/users/**").hasAnyRole("ADMIN", "EDITOR")

                        // Project management
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/**").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/projects/**").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/**").hasRole("ADMIN")

                        // Event management
                        .requestMatchers(HttpMethod.POST, "/api/v1/events/**").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/events/**").hasAnyRole("ADMIN", "EDITOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/events/**").hasRole("ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Stateless session (JWT-based)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add JWT filter before username/password authentication
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}