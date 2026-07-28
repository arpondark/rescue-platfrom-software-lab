package com.shazan.Nexora.controller.ngo;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.dto.ngo.NgoProfileUpdateRequest;
import com.shazan.Nexora.dto.ngo.NgoResponse;
import com.shazan.Nexora.dto.volunteer.AddVolunteerRequest;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.service.ngo.NgoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ngo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NGO_ADMIN')")
public class NgoController {

    private final NgoService service;

    @GetMapping("/profile")
    public ApiResponse<NgoResponse> profile() {
        return ApiResponse.ok(service.profile());
    }

    @PutMapping("/profile")
    public ApiResponse<NgoResponse> updateProfile(@Valid @RequestBody NgoProfileUpdateRequest req) {
        return ApiResponse.ok(service.updateProfile(req));
    }

    @GetMapping("/volunteers")
    public ApiResponse<PageResponse<VolunteerResponse>> volunteers(
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long thanaId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.searchVolunteers(divisionId, districtId, thanaId, q, page, size));
    }

    @PostMapping("/volunteers")
    public ApiResponse<VolunteerResponse> addVolunteer(@Valid @RequestBody AddVolunteerRequest req) {
        return ApiResponse.ok(service.addVolunteer(req));
    }
}
