package com.shazan.Nexora.controller.admin;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.domain.enums.NgoStatus;
import com.shazan.Nexora.dto.event.DisasterEventResponse;
import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.dto.ngo.NgoApprovalRequest;
import com.shazan.Nexora.dto.ngo.NgoResponse;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.service.admin.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService service;

    @GetMapping("/ngos")
    public ApiResponse<PageResponse<NgoResponse>> listNgos(@RequestParam(required = false) NgoStatus status,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.listNgos(status, page, size));
    }

    @PostMapping("/ngos/{id}/approve")
    public ApiResponse<NgoResponse> approveOrReject(@PathVariable Long id, @Valid @RequestBody NgoApprovalRequest req) {
        return ApiResponse.ok(service.reviewNgo(id, req));
    }

    @GetMapping("/volunteers")
    public ApiResponse<PageResponse<VolunteerResponse>> listVolunteers(
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long thanaId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.listVolunteers(divisionId, districtId, thanaId, q, page, size));
    }

    @GetMapping("/events")
    public ApiResponse<PageResponse<DisasterEventResponse>> listEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.listAllEvents(page, size));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.ok(service.stats());
    }

    @PostMapping("/locations/divisions")
    public ApiResponse<LocationDto> addDivision(@RequestParam String name, @RequestParam(required = false) String bnName) {
        return ApiResponse.ok(service.addDivision(name, bnName));
    }

    @PostMapping("/locations/districts")
    public ApiResponse<LocationDto> addDistrict(@RequestParam Long divisionId, @RequestParam String name,
                                               @RequestParam(required = false) String bnName) {
        return ApiResponse.ok(service.addDistrict(divisionId, name, bnName));
    }

    @PostMapping("/locations/thanas")
    public ApiResponse<LocationDto> addThana(@RequestParam Long districtId, @RequestParam String name,
                                             @RequestParam(required = false) String bnName) {
        return ApiResponse.ok(service.addThana(districtId, name, bnName));
    }

    @DeleteMapping("/locations/thanas/{id}")
    public ApiResponse<Void> deleteThana(@PathVariable Long id) {
        service.deleteThana(id);
        return ApiResponse.ok(null);
    }
}
