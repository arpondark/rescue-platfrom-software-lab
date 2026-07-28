package com.shazan.Nexora.dto.invitation;

import com.shazan.Nexora.domain.enums.InvitationStatus;

import java.time.Instant;

public record InvitationResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long volunteerId,
        String volunteerName,
        Long ngoId,
        String ngoName,
        InvitationStatus status,
        Instant invitedAt,
        Instant respondedAt
) {}
