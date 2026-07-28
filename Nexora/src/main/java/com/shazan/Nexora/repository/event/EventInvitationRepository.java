package com.shazan.Nexora.repository.event;

import com.shazan.Nexora.domain.enums.InvitationStatus;
import com.shazan.Nexora.domain.event.DisasterEvent;
import com.shazan.Nexora.domain.event.EventInvitation;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventInvitationRepository extends JpaRepository<EventInvitation, Long> {
    List<EventInvitation> findAllByVolunteer(Volunteer volunteer);
    List<EventInvitation> findAllByEvent(DisasterEvent event);
    Optional<EventInvitation> findByEventAndVolunteer(DisasterEvent event, Volunteer volunteer);
    boolean existsByEventAndVolunteer(DisasterEvent event, Volunteer volunteer);
    long countByEventAndStatus(DisasterEvent event, InvitationStatus status);
}
