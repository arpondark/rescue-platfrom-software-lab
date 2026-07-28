package com.shazan.Nexora.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresInMs,
        UserPrincipal principal
) {
    public record UserPrincipal(
            Long id,
            String email,
            String name,
            String role,
            Long ngoId,
            String ngoStatus
    ) {}
}
