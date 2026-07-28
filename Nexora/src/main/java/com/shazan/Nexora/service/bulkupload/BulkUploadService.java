package com.shazan.Nexora.service.bulkupload;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.shazan.Nexora.common.exception.ApiException;
import com.shazan.Nexora.domain.bulkupload.BulkUploadBatch;
import com.shazan.Nexora.domain.enums.Gender;
import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.domain.location.Thana;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import com.shazan.Nexora.dto.bulkupload.BulkUploadResponse;
import com.shazan.Nexora.email.EmailService;
import com.shazan.Nexora.repository.bulkupload.BulkUploadBatchRepository;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import com.shazan.Nexora.repository.location.ThanaRepository;
import com.shazan.Nexora.repository.volunteer.VolunteerRepository;
import com.shazan.Nexora.security.CurrentUser;
import com.shazan.Nexora.service.ngo.NgoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkUploadService {

    private static final int MAX_ROWS = 5_000;

    private final BulkUploadBatchRepository batchRepository;
    private final VolunteerRepository volunteerRepository;
    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final ThanaRepository thanaRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService email;
    private final NgoService ngoService;
    private final ObjectMapper objectMapper;

    @Transactional
    public BulkUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("FILE_EMPTY", "CSV file is required");
        }
        Ngo ngo = ngoService.currentNgo();
        int total = 0, success = 0, failed = 0;
        List<BulkUploadResponse.RowError> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] header = reader.readNext();
            if (header == null) {
                throw ApiException.badRequest("CSV_EMPTY", "CSV file is empty");
            }
            // Expected header order: name,email,phone,division,district,thana,skills,nid,dateOfBirth,gender
            Map<String, Integer> idx = new HashMap<>();
            for (int i = 0; i < header.length; i++) idx.put(header[i].trim().toLowerCase(), i);
            requireCol(idx, "name"); requireCol(idx, "email"); requireCol(idx, "phone");
            requireCol(idx, "division"); requireCol(idx, "district"); requireCol(idx, "thana"); requireCol(idx, "gender");

            String[] row;
            int line = 1;
            List<Volunteer> toSave = new ArrayList<>();
            while ((row = reader.readNext()) != null) {
                line++;
                total++;
                if (total > MAX_ROWS) {
                    errors.add(new BulkUploadResponse.RowError(line, "Max rows exceeded (" + MAX_ROWS + ")"));
                    failed++;
                    break;
                }
                try {
                    String name = val(row, idx, "name");
                    String emailStr = val(row, idx, "email");
                    String phone = val(row, idx, "phone");
                    String divName = val(row, idx, "division");
                    String distName = val(row, idx, "district");
                    String thanaName = val(row, idx, "thana");
                    String genderStr = val(row, idx, "gender");
                    String skillsStr = idx.containsKey("skills") ? val(row, idx, "skills") : "";
                    String nidStr = idx.containsKey("nid") ? val(row, idx, "nid") : null;
                    String dobStr = idx.containsKey("dateofbirth") ? val(row, idx, "dateofbirth") : null;

                    if (emailStr == null || emailStr.isBlank() || !emailStr.contains("@")) {
                        throw new IllegalArgumentException("Invalid email");
                    }
                    if (volunteerRepository.existsByEmail(emailStr)) {
                        throw new IllegalArgumentException("Email already exists");
                    }

                    Division division = divisionRepository.findByNameIgnoreCase(divName)
                            .orElseThrow(() -> new IllegalArgumentException("Unknown division: " + divName));
                    District district = districtRepository
                            .findByNameIgnoreCaseAndDivision(distName, division)
                            .orElseThrow(() -> new IllegalArgumentException("Unknown district: " + distName + " in " + divName));
                    Thana thana = thanaRepository
                            .findByNameIgnoreCaseAndDistrict(thanaName, district)
                            .orElseThrow(() -> new IllegalArgumentException("Unknown thana: " + thanaName));

                    Gender gender;
                    try { gender = Gender.valueOf(genderStr.toUpperCase()); }
                    catch (Exception ex) { throw new IllegalArgumentException("Invalid gender"); }

                    List<String> skills = skillsStr == null || skillsStr.isBlank() ? List.of()
                            : Arrays.stream(skillsStr.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
                    LocalDate dob = (dobStr == null || dobStr.isBlank()) ? null : LocalDate.parse(dobStr);

                    String tempPwd = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    Volunteer v = Volunteer.builder()
                            .name(name).email(emailStr)
                            .passwordHash(passwordEncoder.encode(tempPwd))
                            .phone(phone).nid(nidStr).dateOfBirth(dob).gender(gender)
                            .division(division).district(district).thana(thana)
                            .skills(new ArrayList<>(skills))
                            .mustSetPassword(true)
                            .recruitedByNgo(ngo)
                            .build();
                    toSave.add(v);
                    success++;
                } catch (Exception ex) {
                    failed++;
                    errors.add(new BulkUploadResponse.RowError(line, ex.getMessage()));
                }
            }
            if (!toSave.isEmpty()) {
                volunteerRepository.saveAll(toSave);
                for (Volunteer v : toSave) {
                    email.sendVolunteerAddedByNgo(v, ngo, "https://nexora.bd/set-password?email=" + v.getEmail());
                }
            }
        } catch (IOException | CsvValidationException ex) {
            throw ApiException.badRequest("CSV_PARSE", "Failed to parse CSV: " + ex.getMessage());
        }

        String errorsJson;
        try {
            errorsJson = objectMapper.writeValueAsString(errors);
        } catch (Exception ex) {
            errorsJson = "[]";
        }
        BulkUploadBatch batch = batchRepository.save(BulkUploadBatch.builder()
                .ngo(ngo).filename(file.getOriginalFilename() == null ? "upload.csv" : file.getOriginalFilename())
                .totalRows(total).successCount(success).failedCount(failed).errorsJson(errorsJson)
                .build());
        return new BulkUploadResponse(batch.getId(), total, success, failed, errors);
    }

    private static void requireCol(Map<String, Integer> idx, String col) {
        if (!idx.containsKey(col)) {
            throw ApiException.badRequest("CSV_MISSING_COL", "Missing required column: " + col);
        }
    }

    private static String val(String[] row, Map<String, Integer> idx, String col) {
        Integer i = idx.get(col);
        if (i == null || i >= row.length) return null;
        String s = row[i];
        return s == null ? null : s.trim();
    }
}