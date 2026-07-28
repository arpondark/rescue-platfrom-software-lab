package com.shazan.Nexora.dto.invitation;

import com.shazan.Nexora.domain.enums.InvitationStatus;
import jakarta.validation.constraints.NotNull;

public record InvitationResponseRequest(@NotNull InvitationStatus status) {}
