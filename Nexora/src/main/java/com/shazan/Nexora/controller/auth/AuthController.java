package com.shazan.Nexora.controller.auth;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.dto.auth.AuthResponse;
import com.shazan.Nexora.dto.auth.LoginRequest;
import com.shazan.Nexora.dto.auth.RefreshTokenRequest;
import com.shazan.Nexora.dto.auth.RegisterNgoRequest;
import com.shazan.Nexora.dto.auth.RegisterVolunteerRequest;
import com.shazan.Nexora.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/volunteer")
    public ApiResponse<AuthResponse> registerVolunteer(@Valid @RequestBody RegisterVolunteerRequest req) {
        return ApiResponse.ok(authService.registerVolunteer(req));
    }

    @PostMapping("/register/ngo")
    public ApiResponse<AuthResponse> registerNgo(@Valid @RequestBody RegisterNgoRequest req) {
        return ApiResponse.ok(authService.registerNgo(req));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ApiResponse.ok(authService.refresh(req.refreshToken()));
    }
}
