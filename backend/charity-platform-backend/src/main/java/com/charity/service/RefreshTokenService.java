package com.charity.service;

import com.charity.entity.RefreshToken;
import com.charity.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Transactional
    public RefreshToken createRefreshToken(String subject, String subjectType) {
        // Revoke any existing tokens for this subject first
        refreshTokenRepository.deleteBySubjectAndSubjectType(subject, subjectType);

        RefreshToken token = new RefreshToken();
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setSubject(subject);
        token.setSubjectType(subjectType);
        token.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays));
        token.setRevoked(false);

        return refreshTokenRepository.save(token);
    }

    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token has expired");
        }
        return token;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken old) {
        old.setRevoked(true);
        refreshTokenRepository.save(old);
        return createRefreshToken(old.getSubject(), old.getSubjectType());
    }

    @Transactional
    public void revokeAllForSubject(String subject, String subjectType) {
        refreshTokenRepository.deleteBySubjectAndSubjectType(subject, subjectType);
    }

    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
