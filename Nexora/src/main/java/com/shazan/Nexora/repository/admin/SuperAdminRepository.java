package com.shazan.Nexora.repository.admin;

import com.shazan.Nexora.domain.admin.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {
    Optional<SuperAdmin> findByEmail(String email);
    boolean existsByEmail(String email);
}
