package com.shazan.Nexora.controller.event;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.domain.enums.EventStatus;
import com.shazan.Nexora.dto.event.DisasterEventRequest;
import com.shazan.Nexora.dto.event.DisasterEventResponse;
import com.shazan.Nexora.dto.event.InviteVolunteersRequest;
import com.shazan.Nexora.dto.invitation.InvitationResponse;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.service.event.DisasterEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DisasterEventController {

    private final DisasterEventService service;

    @GetMapping("/ngo/events")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<PageResponse<DisasterEventResponse>> listForNgo(@RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.listForCurrentNgo(page, size));
    }

    @PostMapping("/ngo/events")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<DisasterEventResponse> create(@Valid @RequestBody DisasterEventRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @GetMapping("/events/{id}")
    public ApiResponse<DisasterEventResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }

    @PostMapping("/events/{id}/invitations")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<DisasterEventService.InviteResult> invite(@PathVariable Long id,
                                                                  @Valid @RequestBody InviteVolunteersRequest req) {
        return ApiResponse.ok(service.invite(id, req));
    }

    @GetMapping("/events/{id}/invitations")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<List<InvitationResponse>> invitations(@PathVariable Long id) {
        return ApiResponse.ok(service.eventInvitations(id));
    }

    @GetMapping("/events/{id}/recommended-volunteers")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<List<VolunteerResponse>> recommended(@PathVariable Long id,
                                                            @RequestParam(required = false) String skill) {
        return ApiResponse.ok(service.recommended(id, skill).stream().map(v -> new VolunteerResponse(
                v.getId(), v.getName(), v.getEmail(), v.getPhone(), v.getNid(),
                v.getDateOfBirth(), v.getGender(),
                v.getDivision() == null ? null : new com.shazan.Nexora.dto.location.LocationDto(v.getDivision().getId(), v.getDivision().getName(), v.getDivision().getBnName(), null),
                v.getDistrict() == null ? null : new com.shazan.Nexora.dto.location.LocationDto(v.getDistrict().getId(), v.getDistrict().getName(), v.getDistrict().getBnName(), v.getDistrict().getDivision().getId()),
                v.getThana() == null ? null : new com.shazan.Nexora.dto.location.LocationDto(v.getThana().getId(), v.getThana().getName(), v.getThana().getBnName(), v.getThana().getDistrict().getId()),
                v.getSkills(), v.getStatus()
        )).toList());
    }

    @PatchMapping("/events/{id}/status")
    @PreAuthorize("hasRole('NGO_ADMIN')")
    public ApiResponse<DisasterEventResponse> updateStatus(@PathVariable Long id, @RequestParam EventStatus status) {
        return ApiResponse.ok(service.changeStatus(id, status));
    }
}
