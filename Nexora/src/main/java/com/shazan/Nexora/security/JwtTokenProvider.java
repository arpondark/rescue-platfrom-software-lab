package com.shazan.Nexora.security;

import com.shazan.Nexora.domain.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long accessExpiryMs;
    private final long refreshExpiryMs;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String secret,
                            @Value("${app.jwt.access-token-expiry-ms}") long accessExpiryMs,
                            @Value("${app.jwt.refresh-token-expiry-ms}") long refreshExpiryMs) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpiryMs = accessExpiryMs;
        this.refreshExpiryMs = refreshExpiryMs;
    }

    public String generateAccessToken(Long userId, String email, Role role, Long ngoId) {
        return build(userId, email, role, ngoId, "access", accessExpiryMs);
    }

    public String generateRefreshToken(Long userId, String email, Role role, Long ngoId) {
        return build(userId, email, role, ngoId, "refresh", refreshExpiryMs);
    }

    private String build(Long userId, String email, Role role, Long ngoId, String type, long expiry) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claims(Map.of(
                        "email", email,
                        "role", role.name(),
                        "ngoId", ngoId == null ? -1L : ngoId,
                        "type", type
                ))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiry))
                .signWith(signingKey)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public long getAccessExpiryMs() { return accessExpiryMs; }
}
