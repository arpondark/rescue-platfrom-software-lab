package com.shazan.Nexora.controller.invitation;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.domain.enums.InvitationStatus;
import com.shazan.Nexora.dto.invitation.InvitationResponse;
import com.shazan.Nexora.dto.invitation.InvitationResponseRequest;
import com.shazan.Nexora.service.event.DisasterEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final DisasterEventService service;

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ApiResponse<InvitationResponse> respond(@PathVariable Long id,
                                                   @Valid @RequestBody InvitationResponseRequest req) {
        return ApiResponse.ok(service.respond(id, req.status()));
    }
}
