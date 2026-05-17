package com.charity.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration:900000}")
    private long accessTokenExpiration;

    // The dev-only fallback value baked into application.properties
    private static final String DEV_FALLBACK_PREFIX = "dGVzdC1zZWNyZXQta2V5LWZvci11bml0";

    /**
     * Validates the JWT secret at startup.
     * App refuses to start if the secret is missing or shorter than 256 bits.
     */
    @PostConstruct
    public void validateSecretKey() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable must be set");
        }
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 256 bits (32 bytes) when base64-decoded");
        }
        if (secretKey.startsWith(DEV_FALLBACK_PREFIX)) {
            log.warn("WARNING: Using the development JWT secret. Set the JWT_SECRET environment variable before deploying to production.");
        }
    }

    /**
     * Single signing key derived from config.
     * FIX: Removed the old random SECRET_KEY field that ignored jwt.secret entirely.
     * Tokens now survive server restarts and are consistent across instances.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate JWT token for a user
     */
    public String generateToken(String subject) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, subject);
    }

    /**
     * Create the actual token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract email (subject) from token
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract username from token — same as extractEmail, kept for compatibility
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Validate token against a subject (email or username)
     */
    public boolean validateToken(String token, String subject) {
        final String extracted = extractUsername(token);
        return extracted.equals(subject) && !isTokenExpired(token);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}