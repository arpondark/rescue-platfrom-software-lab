package com.shazan.Nexora.security;

public record AuthenticatedUser(
        Long id,
        String email,
        String role,
        Long ngoId
) {}
