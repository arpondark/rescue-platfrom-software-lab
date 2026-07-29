package com.shazan.Nexora.bootstrap;

import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds Bangladesh Divisions (8) and Districts (64) on startup if the
 * divisions table is empty. Idempotent — skips when data is already present.
 *
 * Thanas are seeded by {@link BangladeshThanaSeeder}.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class BangladeshSeeder {

    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;

    @Bean
    @Transactional
    public ApplicationRunner seedBangladeshDivisionsAndDistricts() {
        return args -> {
            if (divisionRepository.count() > 0) {
                log.info("Divisions already seeded ({} rows)", divisionRepository.count());
                return;
            }
            log.info("Seeding Bangladesh Divisions and Districts...");

            List<Division> allDivisions = DIVISIONS.stream()
                    .map(entry -> divisionRepository.save(Division.builder()
                            .name(entry.name())
                            .bnName(entry.bnName())
                            .build()))
                    .toList();

            int districtCount = 0;
            for (var divEntry : DISTRICTS_BY_DIVISION.entrySet()) {
                Division division = allDivisions.stream()
                        .filter(d -> d.getName().equals(divEntry.getKey()))
                        .findFirst()
                        .orElseThrow();
                for (var dEntry : divEntry.getValue()) {
                    districtRepository.save(District.builder()
                            .name(dEntry.name())
                            .bnName(dEntry.bnName())
                            .division(division)
                            .build());
                    districtCount++;
                }
            }

            log.info("Seeded {} divisions and {} districts",
                    allDivisions.size(), districtCount);
        };
    }

    // -------- data --------

    private record DivEntry(String name, String bnName) {}
    private record DistEntry(String name, String bnName) {}

    private static final List<DivEntry> DIVISIONS = List.of(
            new DivEntry("Dhaka",      "ঢাকা"),
            new DivEntry("Chittagong", "চট্টগ্রাম"),
            new DivEntry("Rajshahi",   "রাজশাহী"),
            new DivEntry("Khulna",     "খুলা"),
            new DivEntry("Barisal",    "বরিশাল"),
            new DivEntry("Sylhet",     "সিলেট"),
            new DivEntry("Rangpur",    "রংপুর"),
            new DivEntry("Mymensingh", "ময়মনসিংহ")
    );

    private static final java.util.Map<String, List<DistEntry>> DISTRICTS_BY_DIVISION =
            new java.util.LinkedHashMap<>();

    static {
        // Dhaka
        DISTRICTS_BY_DIVISION.put("Dhaka", List.of(
                new DistEntry("Dhaka",         "ঢাকা"),
                new DistEntry("Faridpur",      "ফরিদপুর"),
                new DistEntry("Gazipur",       "গাজীপুর"),
                new DistEntry("Gopalganj",     "গোপালগঞ্জ"),
                new DistEntry("Kishoreganj",   "কিশোরগঞ্জ"),
                new DistEntry("Madaripur",     "মাদারীপুর"),
                new DistEntry("Manikganj",     "মানিকগঞ্জ"),
                new DistEntry("Munshiganj",    "মুন্সিগঞ্জ"),
                new DistEntry("Narayanganj",   "নারায়ণগঞ্জ"),
                new DistEntry("Narsingdi",     "নরসিংদী"),
                new DistEntry("Rajbari",       "রাজবাড়ী"),
                new DistEntry("Shariatpur",    "শরীয়তপুর"),
                new DistEntry("Tangail",       "টাঙ্গাইল")
        ));
        // Chittagong
        DISTRICTS_BY_DIVISION.put("Chittagong", List.of(
                new DistEntry("Chittagong",     "চট্টগ্রাম"),
                new DistEntry("Bandarban",      "বান্দরবান"),
                new DistEntry("Brahmanbaria",   "ব্রাহ্মণবাড়িয়া"),
                new DistEntry("Chandpur",       "চাঁদপুর"),
                new DistEntry("Comilla",        "কুমিল্লা"),
                new DistEntry("Cox's Bazar",    "কক্সবাজার"),
                new DistEntry("Feni",           "ফেনী"),
                new DistEntry("Khagrachhari",   "খাগড়াছড়ি"),
                new DistEntry("Lakshmipur",     "লক্ষ্মীপুর"),
                new DistEntry("Noakhali",       "নোয়াখালী"),
                new DistEntry("Rangamati",      "রাঙ্গামাটি")
        ));
        // Rajshahi
        DISTRICTS_BY_DIVISION.put("Rajshahi", List.of(
                new DistEntry("Rajshahi",        "রাজশাহী"),
                new DistEntry("Bogra",           "বগুড়া"),
                new DistEntry("Chapainawabganj", "চাঁপাইনবাবগঞ্জ"),
                new DistEntry("Joypurhat",       "জয়পুরহাট"),
                new DistEntry("Naogaon",         "নওগাঁ"),
                new DistEntry("Natore",          "নাটোর"),
                new DistEntry("Nawabganj",       "নবাবগঞ্জ"),
                new DistEntry("Pabna",           "পাবনা"),
                new DistEntry("Sirajganj",       "সিরাজগঞ্জ")
        ));
        // Khulna
        DISTRICTS_BY_DIVISION.put("Khulna", List.of(
                new DistEntry("Khulna",    "খুলনা"),
                new DistEntry("Bagerhat",  "বাগেরহাট"),
                new DistEntry("Chuadanga", "চুয়াডাঙ্গা"),
                new DistEntry("Jessore",   "যশোর"),
                new DistEntry("Jhenaidah", "ঝিনাইদহ"),
                new DistEntry("Kushtia",   "কুষ্টিয়া"),
                new DistEntry("Magura",    "মাগুরা"),
                new DistEntry("Meherpur",  "মেহেরপুর"),
                new DistEntry("Narail",    "নড়াইল"),
                new DistEntry("Satkhira",  "সাতক্ষীরা")
        ));
        // Barisal
        DISTRICTS_BY_DIVISION.put("Barisal", List.of(
                new DistEntry("Barisal",    "বরিশাল"),
                new DistEntry("Barguna",    "বরগুনা"),
                new DistEntry("Bhola",      "ভোলা"),
                new DistEntry("Jhalokati",  "ঝালকাঠি"),
                new DistEntry("Patuakhali", "পটুয়াখালী"),
                new DistEntry("Pirojpur",   "পিরোজপুর")
        ));
        // Sylhet
        DISTRICTS_BY_DIVISION.put("Sylhet", List.of(
                new DistEntry("Sylhet",      "সিলেট"),
                new DistEntry("Habiganj",    "হবিগঞ্জ"),
                new DistEntry("Moulvibazar", "মৌলভীবাজার"),
                new DistEntry("Sunamganj",   "সুনামগঞ্জ")
        ));
        // Rangpur
        DISTRICTS_BY_DIVISION.put("Rangpur", List.of(
                new DistEntry("Rangpur",     "রংপুর"),
                new DistEntry("Dinajpur",    "দিনাজপুর"),
                new DistEntry("Gaibandha",   "গাইবান্ধা"),
                new DistEntry("Kurigram",    "কুড়িগ্রাম"),
                new DistEntry("Lalmonirhat", "লালমনিরহাট"),
                new DistEntry("Nilphamari",  "নীলফামারী"),
                new DistEntry("Panchagarh",  "পঞ্চগড়"),
                new DistEntry("Thakurgaon",  "ঠাকুরগাঁও")
        ));
        // Mymensingh
        DISTRICTS_BY_DIVISION.put("Mymensingh", List.of(
                new DistEntry("Mymensingh", "ময়মনসিংহ"),
                new DistEntry("Jamalpur",   "জামালপুর"),
                new DistEntry("Netrokona",  "নেত্রকোনা"),
                new DistEntry("Sherpur",    "শেরপুর")
        ));
    }
}