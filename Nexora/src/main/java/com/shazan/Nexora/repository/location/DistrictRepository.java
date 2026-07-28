package com.shazan.Nexora.repository.location;

import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByDivision(Division division);
    List<District> findByDivisionId(Long divisionId);
    Optional<District> findByNameIgnoreCaseAndDivision(String name, Division division);
}
