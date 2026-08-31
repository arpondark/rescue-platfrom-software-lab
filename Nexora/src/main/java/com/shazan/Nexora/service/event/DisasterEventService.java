package com.shazan.Nexora.service.event;

import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.common.exception.ApiException;
import com.shazan.Nexora.domain.enums.EventStatus;
import com.shazan.Nexora.domain.enums.InvitationStatus;
import com.shazan.Nexora.domain.event.DisasterEvent;
import com.shazan.Nexora.domain.event.EventInvitation;
import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.domain.location.Thana;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import com.shazan.Nexora.dto.event.DisasterEventRequest;
import com.shazan.Nexora.dto.event.DisasterEventResponse;
import com.shazan.Nexora.dto.event.InviteVolunteersRequest;
import com.shazan.Nexora.dto.invitation.InvitationResponse;
import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.email.EmailService;
import com.shazan.Nexora.repository.event.DisasterEventRepository;
import com.shazan.Nexora.repository.event.EventInvitationRepository;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import com.shazan.Nexora.repository.location.ThanaRepository;
import com.shazan.Nexora.repository.volunteer.VolunteerRepository;
import com.shazan.Nexora.security.CurrentUser;
import com.shazan.Nexora.service.ngo.NgoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisasterEventService {

    private final DisasterEventRepository eventRepository;
    private final EventInvitationRepository invitationRepository;
    private final VolunteerRepository volunteerRepository;
    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final ThanaRepository thanaRepository;
    private final EmailService email;
    private final NgoService ngoService;

    public PageResponse<DisasterEventResponse> listForCurrentNgo(int page, int size) {
        Ngo ngo = ngoService.currentNgo();
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.from(eventRepository.findAllByNgo(ngo, pageable).map(this::toResponse));
    }

    public DisasterEventResponse get(Long id) {
        return toResponse(loadEvent(id));
    }

    @Transactional
    public DisasterEventResponse create(DisasterEventRequest req) {
        Ngo ngo = ngoService.currentNgo();
        if (req.endAt().isBefore(req.startAt()) || req.endAt().equals(req.startAt())) {
            throw ApiException.badRequest("BAD_DATES", "endAt must be after startAt");
        }
        DisasterEvent e = DisasterEvent.builder()
                .ngo(ngo).title(req.title()).type(req.type()).severity(req.severity())
                .description(req.description()).startAt(req.startAt()).endAt(req.endAt())
                .requiredVolunteers(req.requiredVolunteers()).status(EventStatus.OPEN)
                .divisions(new HashSet<>(divisionRepository.findAllById(req.divisionIds())))
                .districts(new HashSet<>(req.districtIds() == null ? List.<District>of()
                        : districtRepository.findAllById(req.districtIds())))
                .thanas(new HashSet<>(req.thanaIds() == null ? List.<Thana>of()
                        : thanaRepository.findAllById(req.thanaIds())))
                .build();
        if (e.getDivisions().isEmpty()) {
            throw ApiException.badRequest("NO_LOCATION", "At least one division is required");
        }
        eventRepository.save(e);
        return toResponse(e);
    }

    @Transactional
    public InviteResult invite(Long eventId, InviteVolunteersRequest req) {
        Ngo ngo = ngoService.currentNgo();
        DisasterEvent event = loadEvent(eventId);
        if (!event.getNgo().getId().equals(ngo.getId())) {
            throw ApiException.forbidden("NOT_OWNER", "You don't own this event");
        }
        if (event.getStatus() == EventStatus.CLOSED || event.getStatus() == EventStatus.CANCELLED) {
            throw ApiException.conflict("EVENT_CLOSED", "Event is closed/cancelled");
        }
        int invited = 0, skipped = 0;
        for (Long volunteerId : req.volunteerIds()) {
            Volunteer v = volunteerRepository.findById(volunteerId)
                    .orElse(null);
            if (v == null) { skipped++; continue; }
            if (invitationRepository.existsByEventAndVolunteer(event, v)) { skipped++; continue; }
            EventInvitation inv = EventInvitation.builder()
                    .event(event).volunteer(v).ngo(ngo).status(InvitationStatus.INVITED)
                    .build();
            invitationRepository.save(inv);
            invited++;
            email.sendEventInvitation(inv, event, "https://nexora.bd/volunteer/invitations");
        }
        return new InviteResult(invited, skipped);
    }

    public List<Volunteer> recommended(Long eventId, String skill) {
        DisasterEvent event = loadEvent(eventId);
        List<Long> divisionIds = event.getDivisions().stream().map(Division::getId).toList();
        // Normalize to a non-null string so the JDBC driver binds as varchar.
        String safeSkill = (skill == null || skill.isBlank()) ? "" : skill.trim();
        return volunteerRepository.findRecommendedForDivisions(divisionIds, safeSkill);
    }

    @Transactional
    public InvitationResponse respond(Long invitationId, InvitationStatus newStatus) {
        var cu = CurrentUser.require();
        EventInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> ApiException.notFound("INVITATION_NOT_FOUND", "Invitation not found"));
        if (!inv.getVolunteer().getId().equals(cu.id())) {
            throw ApiException.forbidden("NOT_OWNER", "You don't own this invitation");
        }
        if (newStatus != InvitationStatus.ACCEPTED && newStatus != InvitationStatus.DECLINED) {
            throw ApiException.badRequest("INVALID_RESPONSE", "Only ACCEPTED or DECLINED allowed");
        }
        if (inv.getStatus() != InvitationStatus.INVITED) {
            throw ApiException.conflict("ALREADY_RESPONDED", "Already responded");
        }
        inv.setStatus(newStatus);
        inv.setRespondedAt(Instant.now());
        invitationRepository.save(inv);
        email.sendVolunteerResponseToNgo(inv.getNgo(), inv.getVolunteer(),
                inv.getEvent().getTitle(), newStatus == InvitationStatus.ACCEPTED);
        return new InvitationResponse(inv.getId(), inv.getEvent().getId(), inv.getEvent().getTitle(),
                inv.getVolunteer().getId(), inv.getVolunteer().getName(),
                inv.getNgo().getId(), inv.getNgo().getName(),
                inv.getStatus(), inv.getCreatedAt(), inv.getRespondedAt());
    }

    @Transactional
    public DisasterEventResponse changeStatus(Long eventId, EventStatus newStatus) {
        Ngo ngo = ngoService.currentNgo();
        DisasterEvent e = loadEvent(eventId);
        if (!e.getNgo().getId().equals(ngo.getId())) {
            throw ApiException.forbidden("NOT_OWNER", "You don't own this event");
        }
        e.setStatus(newStatus);
        eventRepository.save(e);
        return toResponse(e);
    }

    public List<InvitationResponse> eventInvitations(Long eventId) {
        DisasterEvent e = loadEvent(eventId);
        return invitationRepository.findAllByEvent(e).stream().map(inv -> new InvitationResponse(
                inv.getId(), inv.getEvent().getId(), inv.getEvent().getTitle(),
                inv.getVolunteer().getId(), inv.getVolunteer().getName(),
                inv.getNgo().getId(), inv.getNgo().getName(),
                inv.getStatus(), inv.getCreatedAt(), inv.getRespondedAt()
        )).toList();
    }

    private DisasterEvent loadEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("EVENT_NOT_FOUND", "Event not found"));
    }

    private DisasterEventResponse toResponse(DisasterEvent e) {
        return new DisasterEventResponse(
                e.getId(), e.getTitle(), e.getType(), e.getSeverity(), e.getDescription(),
                e.getDivisions().stream().map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), null)).toList(),
                e.getDistricts().stream().map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), d.getDivision().getId())).toList(),
                e.getThanas().stream().map(t -> new LocationDto(t.getId(), t.getName(), t.getBnName(), t.getDistrict().getId())).toList(),
                e.getStartAt(), e.getEndAt(), e.getRequiredVolunteers(), e.getStatus(),
                e.getNgo().getId(), e.getNgo().getName(),
                invitationRepository.countByEventAndStatus(e, InvitationStatus.ACCEPTED),
                invitationRepository.countByEventAndStatus(e, InvitationStatus.INVITED),
                invitationRepository.countByEventAndStatus(e, InvitationStatus.DECLINED),
                invitationRepository.countByEventAndStatus(e, InvitationStatus.DEPLOYED),
                e.getCreatedAt()
        );
    }

    public record InviteResult(int invited, int skipped) {}
}