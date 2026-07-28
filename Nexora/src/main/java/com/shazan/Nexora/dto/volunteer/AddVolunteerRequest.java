package com.shazan.Nexora.dto.volunteer;

import com.shazan.Nexora.domain.enums.Gender;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record AddVolunteerRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "^(\\+880|0)1[3-9]\\d{8}$") String phone,
        String nid,
        LocalDate dateOfBirth,
        @NotNull Gender gender,
        @NotNull Long divisionId,
        Long districtId,
        Long thanaId,
        List<String> skills
) {}
