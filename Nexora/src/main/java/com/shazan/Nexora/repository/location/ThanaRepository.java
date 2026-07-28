package com.shazan.Nexora.repository.location;

import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Thana;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ThanaRepository extends JpaRepository<Thana, Long> {
    List<Thana> findByDistrict(District district);
    List<Thana> findByDistrictId(Long districtId);
    Optional<Thana> findByNameIgnoreCaseAndDistrict(String name, District district);
}
