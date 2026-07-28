package com.shazan.Nexora.controller.location;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.service.location.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService service;

    @GetMapping("/divisions")
    public ApiResponse<List<LocationDto>> divisions() {
        return ApiResponse.ok(service.listDivisions());
    }

    @GetMapping("/districts")
    public ApiResponse<List<LocationDto>> districts(@RequestParam Long divisionId) {
        return ApiResponse.ok(service.listDistrictsByDivision(divisionId));
    }

    @GetMapping("/thanas")
    public ApiResponse<List<LocationDto>> thanas(@RequestParam Long districtId) {
        return ApiResponse.ok(service.listThanasByDistrict(districtId));
    }
}
