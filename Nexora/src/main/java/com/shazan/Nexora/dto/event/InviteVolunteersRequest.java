package com.shazan.Nexora.dto.event;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record InviteVolunteersRequest(@NotEmpty List<Long> volunteerIds) {}
