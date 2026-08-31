package com.shazan.Nexora.service.admin;

import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.common.exception.ApiException;
import com.shazan.Nexora.domain.enums.NgoStatus;
import com.shazan.Nexora.domain.enums.VolunteerStatus;
import com.shazan.Nexora.domain.event.DisasterEvent;
import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.domain.location.Thana;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import com.shazan.Nexora.dto.event.DisasterEventResponse;
import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.dto.ngo.NgoApprovalRequest;
import com.shazan.Nexora.dto.ngo.NgoResponse;
import com.shazan.Nexora.dto.volunteer.VolunteerApprovalRequest;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.email.EmailService;
import com.shazan.Nexora.repository.event.DisasterEventRepository;
import com.shazan.Nexora.repository.event.EventInvitationRepository;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import com.shazan.Nexora.repository.location.ThanaRepository;
import com.shazan.Nexora.repository.ngo.NgoRepository;
import com.shazan.Nexora.repository.volunteer.VolunteerRepository;
import com.shazan.Nexora.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final DisasterEventRepository eventRepository;
    private final EventInvitationRepository invitationRepository;
    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final ThanaRepository thanaRepository;
    private final EmailService email;

    @Transactional(readOnly = true)
    public PageResponse<NgoResponse> listNgos(NgoStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ngo> p = status == null ? ngoRepository.findAll(pageable) : ngoRepository.findAllByStatus(status, pageable);
        return PageResponse.from(p.map(this::toNgoResponse));
    }

    @Transactional
    public NgoResponse reviewNgo(Long ngoId, NgoApprovalRequest req) {
        Long adminId = CurrentUser.require().id();
        Ngo ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> ApiException.notFound("NGO_NOT_FOUND", "NGO not found"));
        if (Boolean.TRUE.equals(req.approve())) {
            ngo.setStatus(NgoStatus.APPROVED);
            ngo.setApprovedAt(Instant.now());
            ngo.setApprovedBy(adminId);
            ngo.setRejectionReason(null);
            ngoRepository.save(ngo);
            email.sendNgoApproval(ngo, true, null, "https://nexora.bd/login");
        } else {
            if (req.reason() == null || req.reason().length() < 10) {
                throw ApiException.badRequest("REASON_REQUIRED", "Reason must be at least 10 characters");
            }
            ngo.setStatus(NgoStatus.REJECTED);
            ngo.setRejectionReason(req.reason());
            ngoRepository.save(ngo);
            email.sendNgoApproval(ngo, false, req.reason(), "https://nexora.bd/login");
        }
        return toNgoResponse(ngo);
    }

    @Transactional(readOnly = true)
    public PageResponse<VolunteerResponse> listVolunteers(Long divisionId, Long districtId, Long thanaId,
                                                          VolunteerStatus status, String q, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        boolean hasText = q != null && !q.isBlank();
        var source = hasText
                ? volunteerRepository.searchByText(divisionId, districtId, thanaId, status, q.trim(), pageable)
                : volunteerRepository.search(divisionId, districtId, thanaId, status, pageable);
        return PageResponse.from(source.map(this::toVolunteerResponse));
    }

    @Transactional
    public VolunteerResponse reviewVolunteer(Long volunteerId, VolunteerApprovalRequest req) {
        Volunteer v = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> ApiException.notFound("VOLUNTEER_NOT_FOUND", "Volunteer not found"));
        if (Boolean.TRUE.equals(req.approve())) {
            v.setStatus(VolunteerStatus.ACTIVE);
            volunteerRepository.save(v);
            email.sendVolunteerApproved(v, "https://nexora.bd/login");
        } else {
            if (req.reason() == null || req.reason().length() < 10) {
                throw ApiException.badRequest("REASON_REQUIRED", "Reason must be at least 10 characters");
            }
            v.setStatus(VolunteerStatus.INACTIVE);
            volunteerRepository.save(v);
            email.sendVolunteerRejected(v, req.reason());
        }
        return toVolunteerResponse(v);
    }

    @Transactional(readOnly = true)
    public PageResponse<DisasterEventResponse> listAllEvents(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.from(eventRepository.findAll(pageable).map(this::toEventResponse));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        Map<String, Object> m = new HashMap<>();
        m.put("ngosPending", ngoRepository.countByStatus(NgoStatus.PENDING));
        m.put("ngosApproved", ngoRepository.countByStatus(NgoStatus.APPROVED));
        m.put("ngosRejected", ngoRepository.countByStatus(NgoStatus.REJECTED));
        m.put("volunteersTotal", volunteerRepository.count());
        m.put("volunteersPending", volunteerRepository.countByStatus(VolunteerStatus.PENDING_VERIFICATION));
        m.put("volunteersActive", volunteerRepository.countByStatus(VolunteerStatus.ACTIVE));
        m.put("eventsActive", eventRepository.countByStatus(com.shazan.Nexora.domain.enums.EventStatus.OPEN)
                + eventRepository.countByStatus(com.shazan.Nexora.domain.enums.EventStatus.ONGOING));
        return m;
    }

    @Transactional
    public LocationDto addDivision(String name, String bnName) {
        if (divisionRepository.findByNameIgnoreCase(name).isPresent()) {
            throw ApiException.conflict("DIVISION_EXISTS", "Division already exists");
        }
        var d = divisionRepository.save(Division.builder().name(name).bnName(bnName).build());
        return new LocationDto(d.getId(), d.getName(), d.getBnName(), null);
    }

    @Transactional
    public LocationDto addDistrict(Long divisionId, String name, String bnName) {
        Division div = divisionRepository.findById(divisionId)
                .orElseThrow(() -> ApiException.notFound("DIVISION_NOT_FOUND", "Division not found"));
        var d = districtRepository.save(District.builder().division(div).name(name).bnName(bnName).build());
        return new LocationDto(d.getId(), d.getName(), d.getBnName(), div.getId());
    }

    @Transactional
    public LocationDto addThana(Long districtId, String name, String bnName) {
        District dist = districtRepository.findById(districtId)
                .orElseThrow(() -> ApiException.notFound("DISTRICT_NOT_FOUND", "District not found"));
        var t = thanaRepository.save(Thana.builder().district(dist).name(name).bnName(bnName).build());
        return new LocationDto(t.getId(), t.getName(), t.getBnName(), dist.getId());
    }

    @Transactional
    public void deleteThana(Long thanaId) {
        if (thanaRepository.existsById(thanaId)) {
            long used = volunteerRepository.count() > 0
                    ? volunteerRepository.search(null, null, thanaId, null, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements()
                    : 0;
            if (used > 0) {
                throw ApiException.conflict("THANA_IN_USE", "Thana is in use by volunteers");
            }
            thanaRepository.deleteById(thanaId);
        }
    }

    private NgoResponse toNgoResponse(Ngo ngo) {
        return new NgoResponse(
                ngo.getId(), ngo.getName(), ngo.getEmail(), ngo.getRegistrationNo(),
                ngo.getLogoUrl(), ngo.getPhone(), ngo.getWebsite(),
                ngo.getDivision() == null ? null : new LocationDto(ngo.getDivision().getId(), ngo.getDivision().getName(), ngo.getDivision().getBnName(), null),
                ngo.getDistrict() == null ? null : new LocationDto(ngo.getDistrict().getId(), ngo.getDistrict().getName(), ngo.getDistrict().getBnName(), ngo.getDistrict().getDivision().getId()),
                ngo.getThana() == null ? null : new LocationDto(ngo.getThana().getId(), ngo.getThana().getName(), ngo.getThana().getBnName(), ngo.getThana().getDistrict().getId()),
                ngo.getStatus(), ngo.getRejectionReason(), ngo.getApprovedAt(), ngo.getCreatedAt()
        );
    }

    private VolunteerResponse toVolunteerResponse(Volunteer v) {
        // Detach the Hibernate-backed ElementCollection so Jackson can
        // serialize it after the session is closed. .size() forces load,
        // then List.copyOf() returns a plain immutable list.
        List<String> safeSkills = v.getSkills() == null ? List.of() : List.copyOf(v.getSkills());
        return new VolunteerResponse(
                v.getId(), v.getName(), v.getEmail(), v.getPhone(), v.getNid(),
                v.getDateOfBirth(), v.getGender(),
                v.getDivision() == null ? null : new LocationDto(v.getDivision().getId(), v.getDivision().getName(), v.getDivision().getBnName(), null),
                v.getDistrict() == null ? null : new LocationDto(v.getDistrict().getId(), v.getDistrict().getName(), v.getDistrict().getBnName(), v.getDistrict().getDivision().getId()),
                v.getThana() == null ? null : new LocationDto(v.getThana().getId(), v.getThana().getName(), v.getThana().getBnName(), v.getThana().getDistrict().getId()),
                safeSkills, v.getStatus()
        );
    }

    private DisasterEventResponse toEventResponse(DisasterEvent e) {
        // Same defensive copy as Volunteer.skills: ElementCollections must
        // be detached before the Hibernate session closes, otherwise
        // Jackson will try to lazily read them at serialization time.
        List<LocationDto> divs = e.getDivisions().stream()
                .map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), null)).toList();
        List<LocationDto> dists = e.getDistricts().stream()
                .map(d -> new LocationDto(d.getId(), d.getName(), d.getBnName(), d.getDivision().getId())).toList();
        List<LocationDto> thns = e.getThanas().stream()
                .map(t -> new LocationDto(t.getId(), t.getName(), t.getBnName(), t.getDistrict().getId())).toList();
        return new DisasterEventResponse(
                e.getId(), e.getTitle(), e.getType(), e.getSeverity(), e.getDescription(),
                divs, dists, thns,
                e.getStartAt(), e.getEndAt(), e.getRequiredVolunteers(), e.getStatus(),
                e.getNgo().getId(), e.getNgo().getName(),
                invitationRepository.countByEventAndStatus(e, com.shazan.Nexora.domain.enums.InvitationStatus.ACCEPTED),
                invitationRepository.countByEventAndStatus(e, com.shazan.Nexora.domain.enums.InvitationStatus.INVITED),
                invitationRepository.countByEventAndStatus(e, com.shazan.Nexora.domain.enums.InvitationStatus.DECLINED),
                invitationRepository.countByEventAndStatus(e, com.shazan.Nexora.domain.enums.InvitationStatus.DEPLOYED),
                e.getCreatedAt()
        );
    }
}
