package com.shazan.Nexora.controller.ngo;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.common.PageResponse;
import com.shazan.Nexora.dto.ngo.NgoProfileUpdateRequest;
import com.shazan.Nexora.dto.ngo.NgoResponse;
import com.shazan.Nexora.dto.volunteer.AddVolunteerRequest;
import com.shazan.Nexora.dto.volunteer.BulkUploadResponse;
import com.shazan.Nexora.dto.volunteer.VolunteerResponse;
import com.shazan.Nexora.service.ngo.NgoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ngo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NGO_ADMIN')")
public class NgoController {

    private final NgoService service;

    @GetMapping("/profile")
    public ApiResponse<NgoResponse> profile() {
        return ApiResponse.ok(service.profile());
    }

    @PutMapping("/profile")
    public ApiResponse<NgoResponse> updateProfile(@Valid @RequestBody NgoProfileUpdateRequest req) {
        return ApiResponse.ok(service.updateProfile(req));
    }

    @GetMapping("/volunteers")
    public ApiResponse<PageResponse<VolunteerResponse>> volunteers(
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long thanaId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(service.searchVolunteers(divisionId, districtId, thanaId, q, page, size));
    }

    @PostMapping("/volunteers")
    public ApiResponse<VolunteerResponse> addVolunteer(@Valid @RequestBody AddVolunteerRequest req) {
        return ApiResponse.ok(service.addVolunteer(req));
    }

    /**
     * Bulk volunteer upload via CSV. The frontend posts the file as
     * {@code multipart/form-data} under the {@code file} field. Returns a
     * {@link BulkUploadResponse} with per-row errors and overall counts.
     */
    @PostMapping(value = "/volunteers/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BulkUploadResponse> bulkUploadVolunteers(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(service.bulkUploadVolunteers(file));
    }

    /**
     * Downloadable CSV template with `#`-prefixed instructions, the real
     * header row, and one sample row referencing real seeded locations.
     */
    @GetMapping(value = "/volunteers/bulk/template", produces = "text/csv")
    public ResponseEntity<byte[]> downloadBulkTemplate() {
        byte[] csv = service.bulkUploadTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"volunteers-template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
