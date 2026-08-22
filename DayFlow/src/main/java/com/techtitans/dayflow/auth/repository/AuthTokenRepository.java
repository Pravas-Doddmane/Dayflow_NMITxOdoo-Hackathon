package com.techtitans.dayflow.auth.repository;

import com.techtitans.dayflow.auth.entity.AuthToken;
import com.techtitans.dayflow.common.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

    Optional<AuthToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("DELETE FROM AuthToken t WHERE t.expiresAt < :now AND t.usedAt IS NULL")
    void deleteExpiredTokens(@Param("now") Instant now);

    @Modifying
    @Query("UPDATE AuthToken t SET t.usedAt = :now WHERE t.tokenHash = :tokenHash")
    void markAsUsed(@Param("tokenHash") String tokenHash, @Param("now") Instant now);

    @Query("SELECT t FROM AuthToken t WHERE t.user.id = :userId AND t.tokenType = :type AND t.usedAt IS NULL AND t.expiresAt > :now")
    Optional<AuthToken> findActiveTokenByUserAndType(
            @Param("userId") Long userId,
            @Param("type") TokenType type,
            @Param("now") Instant now);
}
