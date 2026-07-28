package com.shazan.Nexora.repository.volunteer;

import com.shazan.Nexora.domain.volunteer.Volunteer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
           SELECT v FROM Volunteer v
           WHERE (:divisionId IS NULL OR v.division.id = :divisionId)
             AND (:districtId IS NULL OR v.district.id = :districtId)
             AND (:thanaId IS NULL OR v.thana.id = :thanaId)
             AND (:q IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :q, '%'))
                       OR LOWER(v.email) LIKE LOWER(CONCAT('%', :q, '%')))
           """)
    Page<Volunteer> search(@Param("divisionId") Long divisionId,
                           @Param("districtId") Long districtId,
                           @Param("thanaId") Long thanaId,
                           @Param("q") String q,
                           Pageable pageable);

    @Query("""
           SELECT DISTINCT v FROM Volunteer v
           LEFT JOIN v.skills s
           WHERE v.division.id IN :divisionIds
             AND v.status = com.shazan.Nexora.domain.enums.VolunteerStatus.ACTIVE
             AND (:skill IS NULL OR LOWER(s) = LOWER(:skill))
           """)
    List<Volunteer> findRecommendedForDivisions(@Param("divisionIds") List<Long> divisionIds,
                                                @Param("skill") String skill);
}
