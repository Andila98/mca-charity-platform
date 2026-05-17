package com.charity.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500}")
    private List<String> allowedOrigins;

    /**
     * CORS Configuration Bean
     * Allows frontend to communicate with backend
     *
     * SECURITY NOTE: Never use "*" in production!
     * Always specify exact allowed origins.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Exact origins from cors.allowed-origins property (env-var configurable for prod)
        configuration.setAllowedOrigins(allowedOrigins);

        // Allow these HTTP methods
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow these headers
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "Origin",
                "Access-Control-Request-Method", "Access-Control-Request-Headers", "X-Requested-With"
        ));

        // Expose these headers to the frontend
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Set-Cookie"
        ));

        // ✅ SECURE: Allow credentials with specific origins
        configuration.setAllowCredentials(true);

        // How long the browser should cache preflight requests (in seconds)
        configuration.setMaxAge(3600L);

        // Apply this configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
