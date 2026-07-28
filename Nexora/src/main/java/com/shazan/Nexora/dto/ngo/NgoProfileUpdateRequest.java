package com.shazan.Nexora.dto.ngo;

import jakarta.validation.constraints.*;

public record NgoProfileUpdateRequest(
        @Size(max = 150) String name,
        @Pattern(regexp = "^(\\+880|0)1[3-9]\\d{8}$") String phone,
        @Size(max = 200) String website,
        String logoUrl,
        Long divisionId,
        Long districtId,
        Long thanaId
) {}
