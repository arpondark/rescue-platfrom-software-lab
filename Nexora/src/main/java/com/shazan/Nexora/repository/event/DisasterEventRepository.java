package com.shazan.Nexora.repository.event;

import com.shazan.Nexora.domain.enums.EventStatus;
import com.shazan.Nexora.domain.event.DisasterEvent;
import com.shazan.Nexora.domain.ngo.Ngo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisasterEventRepository extends JpaRepository<DisasterEvent, Long> {
    Page<DisasterEvent> findAllByNgo(Ngo ngo, Pageable pageable);
    Page<DisasterEvent> findAll(Pageable pageable);
    List<DisasterEvent> findAllByStatus(EventStatus status);
    long countByNgo(Ngo ngo);
    long countByStatus(EventStatus status);
}
