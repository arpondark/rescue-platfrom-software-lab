package com.shazan.Nexora.repository.ngo;

import com.shazan.Nexora.domain.enums.NgoStatus;
import com.shazan.Nexora.domain.ngo.Ngo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NgoRepository extends JpaRepository<Ngo, Long> {
    Optional<Ngo> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRegistrationNo(String registrationNo);
    Page<Ngo> findAllByStatus(NgoStatus status, Pageable pageable);
    Page<Ngo> findAll(Pageable pageable);
    List<Ngo> findAllByStatus(NgoStatus status);
}
