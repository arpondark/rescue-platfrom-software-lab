package com.shazan.Nexora.dto.location;

public record LocationDto(
        Long id,
        String name,
        String bnName,
        Long parentId
) {}
