package com.techtitans.dayflow.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jwt.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

/**
 * Service for issuing and validating JWTs using Nimbus JOSE+JWT (bundled in Spring Boot).
 * Uses HMAC-SHA256 (HS256) with a symmetric secret key.
 */
@Slf4j
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // Pad or truncate to 32 bytes for HS256
        byte[] keyPadded = new byte[32];
        System.arraycopy(keyBytes, 0, keyPadded, 0, Math.min(keyBytes.length, 32));
        this.secretKey = new SecretKeySpec(keyPadded, "HmacSHA256");
        this.expirationMs = expirationMs;
    }

    /**
     * Generate JWT for a user with company context.
     */
    public String generateToken(Long userId, String role, Long employeeId, Long companyId, String companyName) {
        try {
            Instant now = Instant.now();
            Instant expiry = now.plusMillis(expirationMs);

            JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                    .subject(String.valueOf(userId))
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiry))
                    .claim("role", role)
                    .claim("userId", userId);

            if (employeeId != null) {
                claimsBuilder.claim("employeeId", employeeId);
            }
            if (companyId != null) {
                claimsBuilder.claim("companyId", companyId);
            }
            if (companyName != null) {
                claimsBuilder.claim("companyName", companyName);
            }

            JWTClaimsSet claims = claimsBuilder.build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claims
            );

            signedJWT.sign(new MACSigner(secretKey));
            return signedJWT.serialize();

        } catch (JOSEException e) {
            log.error("Failed to generate JWT token");
            throw new RuntimeException("Token generation failed", e);
        }
    }

    public String generateToken(Long userId, String role, Long employeeId) {
        return generateToken(userId, role, employeeId, null, null);
    }

    /**
     * Validate token and return claims if valid.
     */
    public JWTClaimsSet validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secretKey);

            if (!signedJWT.verify(verifier)) {
                throw new RuntimeException("Invalid JWT signature");
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            if (claims.getExpirationTime().before(new Date())) {
                throw new RuntimeException("JWT token has expired");
            }

            return claims;

        } catch (ParseException | JOSEException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    /**
     * Extract user ID from token.
     */
    public Long extractUserId(String token) {
        try {
            JWTClaimsSet claims = validateToken(token);
            return claims.getLongClaim("userId");
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract userId from token", e);
        }
    }

    /**
     * Extract role from token.
     */
    public String extractRole(String token) {
        try {
            JWTClaimsSet claims = validateToken(token);
            return claims.getStringClaim("role");
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract role from token", e);
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
