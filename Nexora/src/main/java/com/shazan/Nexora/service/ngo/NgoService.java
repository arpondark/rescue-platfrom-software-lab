package com.shazan.Nexora.service.ngo;

import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.common.exception.ApiException;
import com.shazan.Nexora.domain.enums.NgoStatus;
import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.domain.location.Thana;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import com.shazan.Nexora.dto.location.LocationDto;
import com.shazan.Nexora.dto.ngo.NgoProfileUpdateRequest;
import com.shazan.Nexora.dto.ngo.NgoResponse;
import com.shazan.Nexora.dto.volunteer.AddVolunteerRequest;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.email.EmailService;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class NgoService {

    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final ThanaRepository thanaRepository;
    private final EmailService email;

    public Ngo currentNgo() {
        Long id = CurrentUser.ngoIdOrThrow();
        Ngo ngo = ngoRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("NGO_NOT_FOUND", "NGO not found"));
        if (ngo.getStatus() != NgoStatus.APPROVED) {
            throw ApiException.forbidden("NGO_NOT_APPROVED", "NGO is not approved");
        }
        return ngo;
    }

    public NgoResponse profile() {
        return toResponse(currentNgo());
    }

    @Transactional
    public NgoResponse updateProfile(NgoProfileUpdateRequest req) {
        Ngo ngo = currentNgo();
        if (req.name() != null) ngo.setName(req.name());
        if (req.phone() != null) ngo.setPhone(req.phone());
        if (req.website() != null) ngo.setWebsite(req.website());
        if (req.logoUrl() != null) ngo.setLogoUrl(req.logoUrl());
        if (req.divisionId() != null) {
            Division d = divisionRepository.findById(req.divisionId())
                    .orElseThrow(() -> ApiException.badRequest("DIVISION_NOT_FOUND", "Invalid division"));
            ngo.setDivision(d);
        }
        if (req.districtId() != null) {
            District d = districtRepository.findById(req.districtId())
                    .orElseThrow(() -> ApiException.badRequest("DISTRICT_NOT_FOUND", "Invalid district"));
            ngo.setDistrict(d);
        }
        if (req.thanaId() != null) {
            Thana t = thanaRepository.findById(req.thanaId())
                    .orElseThrow(() -> ApiException.badRequest("THANA_NOT_FOUND", "Invalid thana"));
            ngo.setThana(t);
        }
        ngoRepository.save(ngo);
        return toResponse(ngo);
    }

    public PageResponse<VolunteerResponse> searchVolunteers(Long divisionId, Long districtId, Long thanaId,
                                                            String q, int page, int size) {
        Ngo ngo = currentNgo();
        // default division = NGO's division if no filter provided
        Long div = divisionId != null ? divisionId : (ngo.getDivision() != null ? ngo.getDivision().getId() : null);
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Volunteer> p = volunteerRepository.search(div, districtId, thanaId, q, pageable);
        return PageResponse.from(p.map(this::toVolunteerResponse));
    }

    @Transactional
    public VolunteerResponse addVolunteer(AddVolunteerRequest req) {
        Ngo ngo = currentNgo();
        // idempotent: if email exists, just return existing record
        var existing = volunteerRepository.findByEmail(req.email());
        if (existing.isPresent()) {
            return toVolunteerResponse(existing.get());
        }
        Division division = divisionRepository.findById(req.divisionId())
                .orElseThrow(() -> ApiException.badRequest("DIVISION_NOT_FOUND", "Invalid division"));
        District district = req.districtId() == null ? null : districtRepository.findById(req.districtId())
                .orElseThrow(() -> ApiException.badRequest("DISTRICT_NOT_FOUND", "Invalid district"));
        Thana thana = req.thanaId() == null ? null : thanaRepository.findById(req.thanaId())
                .orElseThrow(() -> ApiException.badRequest("THANA_NOT_FOUND", "Invalid thana"));

        String tempPassword = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        Volunteer v = Volunteer.builder()
                .name(req.name()).email(req.email())
                .passwordHash(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(10).encode(tempPassword))
                .phone(req.phone()).nid(req.nid())
                .dateOfBirth(req.dateOfBirth()).gender(req.gender())
                .division(division).district(district).thana(thana)
                .skills(req.skills() == null ? new java.util.ArrayList<>() : new java.util.ArrayList<>(req.skills()))
                .mustSetPassword(true)
                .recruitedByNgo(ngo)
                .build();
        volunteerRepository.save(v);
        email.sendVolunteerAddedByNgo(v, ngo, "https://nexora.bd/set-password?email=" + v.getEmail());
        return toVolunteerResponse(v);
    }

    private NgoResponse toResponse(Ngo ngo) {
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
        return new VolunteerResponse(
                v.getId(), v.getName(), v.getEmail(), v.getPhone(), v.getNid(),
                v.getDateOfBirth(), v.getGender(),
                v.getDivision() == null ? null : new LocationDto(v.getDivision().getId(), v.getDivision().getName(), v.getDivision().getBnName(), null),
                v.getDistrict() == null ? null : new LocationDto(v.getDistrict().getId(), v.getDistrict().getName(), v.getDistrict().getBnName(), v.getDistrict().getDivision().getId()),
                v.getThana() == null ? null : new LocationDto(v.getThana().getId(), v.getThana().getName(), v.getThana().getBnName(), v.getThana().getDistrict().getId()),
                v.getSkills(), v.getStatus()
        );
    }

    public List<Long> getNgoDivisionIds() {
        Ngo ngo = currentNgo();
        return ngo.getDivision() == null ? List.of() : List.of(ngo.getDivision().getId());
    }
}
