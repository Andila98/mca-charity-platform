package com.charity.service;

import com.charity.entity.RefreshToken;
import com.charity.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpirationDays", 7);
    }

    @Test
    void createRefreshToken_returnsTokenWithCorrectFields() {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken("user@example.com", "USER");

        assertThat(token.getSubject()).isEqualTo("user@example.com");
        assertThat(token.getSubjectType()).isEqualTo("USER");
        assertThat(token.getToken()).isNotBlank();
        assertThat(token.getExpiresAt()).isAfter(LocalDateTime.now());
        assertThat(token.isRevoked()).isFalse();
    }

    @Test
    void verifyRefreshToken_withValidToken_returnsToken() {
        RefreshToken stored = new RefreshToken();
        stored.setToken("valid-token");
        stored.setRevoked(false);
        stored.setExpiresAt(LocalDateTime.now().plusDays(7));

        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(stored));

        RefreshToken result = refreshTokenService.verifyRefreshToken("valid-token");

        assertThat(result).isEqualTo(stored);
    }

    @Test
    void verifyRefreshToken_withRevokedToken_throwsException() {
        RefreshToken stored = new RefreshToken();
        stored.setToken("revoked-token");
        stored.setRevoked(true);
        stored.setExpiresAt(LocalDateTime.now().plusDays(7));

        when(refreshTokenRepository.findByToken("revoked-token")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> refreshTokenService.verifyRefreshToken("revoked-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("revoked");
    }

    @Test
    void verifyRefreshToken_withExpiredToken_throwsException() {
        RefreshToken stored = new RefreshToken();
        stored.setToken("expired-token");
        stored.setRevoked(false);
        stored.setExpiresAt(LocalDateTime.now().minusDays(1));

        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> refreshTokenService.verifyRefreshToken("expired-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void verifyRefreshToken_withUnknownToken_throwsException() {
        when(refreshTokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.verifyRefreshToken("unknown"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    void rotateRefreshToken_revokesOldAndCreatesNew() {
        RefreshToken old = new RefreshToken();
        old.setSubject("user@example.com");
        old.setSubjectType("USER");
        old.setRevoked(false);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken rotated = refreshTokenService.rotateRefreshToken(old);

        assertThat(old.isRevoked()).isTrue();
        assertThat(rotated.getSubject()).isEqualTo("user@example.com");
        assertThat(rotated.getToken()).isNotEqualTo(old.getToken());
        // Old token must be persisted as revoked before the new one is created
        verify(refreshTokenRepository).save(old);
    }

    @Test
    void revokeAllForSubject_deletesAllTokensForSubject() {
        refreshTokenService.revokeAllForSubject("user@example.com", "USER");

        verify(refreshTokenRepository).deleteBySubjectAndSubjectType("user@example.com", "USER");
    }
}
