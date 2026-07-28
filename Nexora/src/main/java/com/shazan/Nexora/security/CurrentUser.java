package com.shazan.Nexora.security;

import com.shazan.Nexora.common.exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {}

    public static AuthenticatedUser require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AuthenticatedUser u)) {
            throw ApiException.unauthorized("UNAUTHENTICATED", "Authentication required");
        }
        return u;
    }

    public static Long ngoIdOrThrow() {
        AuthenticatedUser u = require();
        if (u.ngoId() == null || u.ngoId() <= 0) {
            throw ApiException.forbidden("NGO_CONTEXT_MISSING", "NGO context required");
        }
        return u.ngoId();
    }
}
