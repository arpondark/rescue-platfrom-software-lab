package com.shazan.Nexora.repository.location;

import com.shazan.Nexora.domain.location.Division;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DivisionRepository extends JpaRepository<Division, Long> {
    Optional<Division> findByNameIgnoreCase(String name);
}
