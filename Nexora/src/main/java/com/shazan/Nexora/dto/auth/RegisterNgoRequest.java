package com.shazan.Nexora.dto.auth;

import jakarta.validation.constraints.*;

public record RegisterNgoRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 100) String registrationNo,
        @NotBlank @Pattern(regexp = "^(\\+880|0)1[3-9]\\d{8}$") String phone,
        String website,
        String logoUrl,
        @NotNull Long divisionId,
        @NotNull Long districtId,
        @NotNull Long thanaId
) {}
