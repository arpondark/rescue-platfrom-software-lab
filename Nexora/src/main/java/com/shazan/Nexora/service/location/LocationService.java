package com.shazan.Nexora.service.location;

import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import com.shazan.Nexora.repository.location.ThanaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final DivisionRepository divisions;
    private final DistrictRepository districts;
    private final ThanaRepository thanas;

    public List<LocationDto> listDivisions() {
        return divisions.findAll().stream()
                .map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), null)).toList();
    }

    public List<LocationDto> listDistrictsByDivision(Long divisionId) {
        return districts.findByDivisionId(divisionId).stream()
                .map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), d.getDivision().getId())).toList();
    }

    public List<LocationDto> listThanasByDistrict(Long districtId) {
        return thanas.findByDistrictId(districtId).stream()
                .map(t -> new LocationDto(t.getId(), t.getName(), t.getBnName(), t.getDistrict().getId())).toList();
    }
}
