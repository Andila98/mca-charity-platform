package com.charity.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from these origins (frontend URLs)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",      // React default
                "http://localhost:5500",      // Live Server default
                "http://127.0.0.1:5500",      // Live Server alternative
                "http://localhost:8081",      // Alternative port
                "http://localhost:4200",      // Angular default
                "http://localhost:5173",      // Vite default
                "*"                           // Allow all (for development only!)
        ));

        // Allow these HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        // Allow these headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // Expose these headers to the frontend
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type"
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // How long the browser should cache preflight requests (in seconds)
        configuration.setMaxAge(3600L);

        // Apply this configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
