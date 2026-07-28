package com.shazan.Nexora.controller.bulkupload;

import com.shazan.Nexora.common.ApiResponse;
import com.shazan.Nexora.dto.bulkupload.BulkUploadResponse;
import com.shazan.Nexora.service.bulkupload.BulkUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
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
public class BulkUploadController {

    private final BulkUploadService service;

    @PostMapping(value = "/volunteers/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BulkUploadResponse> bulkUpload(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(service.upload(file));
    }

    @GetMapping("/volunteers/bulk/template")
    public ResponseEntity<ByteArrayResource> downloadTemplate() {
        String csv = """
                name,email,phone,division,district,thana,gender,skills,nid,dateOfBirth
                Rahim Mia,rahim@example.com,01712345678,Dhaka,Dhaka,Savar,MALE,"first-aid,swimming",1234567890,1995-01-15
                """;
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=volunteers-template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new ByteArrayResource(bytes));
    }
}