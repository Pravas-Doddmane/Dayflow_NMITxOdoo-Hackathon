package com.techtitans.dayflow.auth.service;

import com.techtitans.dayflow.auth.entity.AuthToken;
import com.techtitans.dayflow.auth.repository.AuthTokenRepository;
import com.techtitans.dayflow.common.enums.TokenType;
import com.techtitans.dayflow.common.exception.InvalidTokenException;
import com.techtitans.dayflow.common.exception.TokenExpiredException;
import com.techtitans.dayflow.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Service for creating and consuming secure one-time tokens.
 * Raw tokens are generated with SecureRandom, hashed with SHA-256, and stored hashed.
 * Only the raw token is ever sent to the user (via email). Never stored.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenService {

    private final AuthTokenRepository authTokenRepository;

    @Value("${app.token.password-setup-expiry-hours:48}")
    private long setupExpiryHours;

    @Value("${app.token.password-reset-expiry-hours:1}")
    private long resetExpiryHours;

    @Value("${app.token.email-verify-expiry-hours:24}")
    private long emailVerifyExpiryHours;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a secure one-time token, store hashed, return raw.
     */
    @Transactional
    public String createToken(User user, TokenType type) {
        // Generate 32-byte random token
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        // Hash the token for storage
        String tokenHash = hashToken(rawToken);

        // Determine expiry
        long expiryHours = switch (type) {
            case PASSWORD_SETUP -> setupExpiryHours;
            case PASSWORD_RESET -> resetExpiryHours;
            case EMAIL_VERIFICATION -> emailVerifyExpiryHours;
        };

        // Save hashed token
        AuthToken authToken = AuthToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .tokenType(type)
                .expiresAt(Instant.now().plus(expiryHours, ChronoUnit.HOURS))
                .build();

        authTokenRepository.save(authToken);
        log.info("Created {} token for user ID: {} (Token for dev/testing: {})", type, user.getId(), rawToken);

        // Return RAW token (only ever sent in email — never stored)
        return rawToken;
    }

    /**
     * Validate a raw token: find by hash, check type, expiry, and used state.
     */
    @Transactional(readOnly = true)
    public AuthToken validateToken(String rawToken, TokenType expectedType) {
        String tokenHash = hashToken(rawToken);

        AuthToken authToken = authTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or unrecognized token"));

        if (authToken.isUsed()) {
            throw new InvalidTokenException("This token has already been used");
        }

        if (authToken.isExpired()) {
            throw new TokenExpiredException("This token has expired. Please request a new one");
        }

        if (authToken.getTokenType() != expectedType) {
            throw new InvalidTokenException("Token type mismatch");
        }

        return authToken;
    }

    /**
     * Mark a token as consumed. Must be called after successful use.
     */
    @Transactional
    public void consumeToken(AuthToken authToken) {
        authTokenRepository.markAsUsed(authToken.getTokenHash(), Instant.now());
        log.info("Consumed {} token for user ID: {}", authToken.getTokenType(), authToken.getUser().getId());
    }

    /**
     * SHA-256 hash of raw token (URL-safe Base64 → hex string).
     */
    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
