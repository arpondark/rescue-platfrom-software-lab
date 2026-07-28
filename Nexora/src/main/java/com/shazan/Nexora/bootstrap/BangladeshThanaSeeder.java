package com.shazan.Nexora.bootstrap;

import com.shazan.Nexora.domain.location.District;
import com.shazan.Nexora.domain.location.Division;
import com.shazan.Nexora.domain.location.Thana;
import com.shazan.Nexora.repository.location.DistrictRepository;
import com.shazan.Nexora.repository.location.DivisionRepository;
import com.shazan.Nexora.repository.location.ThanaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Seeds Bangladesh Thanas (Upazilas) on startup if the thanas table is empty.
 * Idempotent — skips if there's already data.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class BangladeshThanaSeeder {

    private final DivisionRepository divisionRepository;
    private final DistrictRepository districtRepository;
    private final ThanaRepository thanaRepository;

    @Bean
    @Transactional
    public ApplicationRunner seedThanas() {
        return args -> {
            if (thanaRepository.count() > 0) {
                log.info("Thanas table already seeded ({} rows)", thanaRepository.count());
                return;
            }
            log.info("Seeding Bangladesh Thanas (Upazilas)...");
            int inserted = 0;
            // Map of district name (case insensitive) -> thanas
            Map<String, List<String>> data = BD_THANAS;
            for (Division div : divisionRepository.findAll()) {
                for (District dist : districtRepository.findByDivision(div)) {
                    List<String> thanas = data.get(dist.getName().toLowerCase());
                    if (thanas == null) continue;
                    for (String tname : thanas) {
                        thanaRepository.save(Thana.builder()
                                .district(dist).name(tname)
                                .bnName(tname)
                                .build());
                        inserted++;
                    }
                }
            }
            log.info("Seeded {} thanas", inserted);
        };
    }

    /**
     * Curated list of thanas per district. Coverage focused on disaster-prone
     * regions; can be expanded freely. Format keys: lowercase district name.
     */
    private static final Map<String, List<String>> BD_THANAS = Map.ofEntries(
            // Dhaka division
            entry("dhaka", List.of("Dhamrai","Dhanmondi","Gulshan","Kadamtali","Kafrul","Kamrangirchar","Khilgaon","Kotwali","Lalbagh","Mirpur","Mohammadpur","Motijheel","Nawabganj","Pallabi","Ramna","Sabujbagh","Shah Ali","Shahbag","Sher-e-Bangla Nagar","Sutrapur","Tejgaon","Turag","Uttara","Uttar Khan","Badda","Bangshal","Demra","Hazaribagh","Jatrabari","Keraniganj","Gulshan Model Town","Mirpur Model")),
            entry("faridpur", List.of("Faridpur Sadar","Alfadanga","Boalmari","Charbhadrasan","Madhukhali","Nagarkanda","Sadarpur","Saltha")),
            entry("gazipur", List.of("Gazipur Sadar","Kaliakair","Kaliganj","Kapasia","Sreepur")),
            entry("gopalganj", List.of("Gopalganj Sadar","Kashiani","Kotalipara","Muksudpur","Tungipara")),
            entry("kishoreganj", List.of("Kishoreganj Sadar","Bajitpur","Bhairab","Hossainpur","Itna","Karimganj","Katiadi","Kuliarchar","Mithamain","Nikli","Pakundia","Sarail","Tarail")),
            entry("madaripur", List.of("Madaripur Sadar","Dasar","Kalkini","Rajoir","Shibchar")),
            entry("manikganj", List.of("Manikganj Sadar","Daulatpur","Ghior","Harirampur","Saturia","Shivalaya","Singair")),
            entry("munshiganj", List.of("Munshiganj Sadar","Gazaria","Lohajang","Sirajdikhan","Sreenagar","Tongibari")),
            entry("narayanganj", List.of("Narayanganj Sadar","Araihazar","Bandar","Rupganj","Sonargaon")),
            entry("narsingdi", List.of("Narsingdi Sadar","Belabo","Monohardi","Palash","Raipura","Shibpur")),
            entry("rajbari", List.of("Rajbari Sadar","Baliakandi","Goalandaghat","Kalukhali","Pangsha")),
            entry("shariatpur", List.of("Shariatpur Sadar","Bhedarganj","Damuddya","Gosairhat","Naria","Sakhipur","Zajira")),
            entry("tangail", List.of("Tangail Sadar","Basail","Bhuapur","Delduar","Dhanbari","Ghatail","Gopalpur","Kalihati","Madhupur","Mirzapur","Nagarpur","Sakhipur")),

            // Chittagong division
            entry("chittagong", List.of("Anwara","Banshkhali","Boalkhali","Chandanaish","Fatikchhari","Hathazari","Karnaphuli","Khulshi","Lohagara","Mirsharai","Pahartali","Panchlaish","Patenga","Rangunia","Raozan","Sandwip","Satkania","Sitakunda","Double Mooring","Bakalia","Bandar","Kotwali","Patiya")),
            entry("bandarban", List.of("Bandarban Sadar","Ali Kadam","Lama","Naikhongchhari","Rowangchhari","Ruma","Thanchi")),
            entry("brahmanbaria", List.of("Brahmanbaria Sadar","Akhaura","Bancharampur","Bijoynagar","Kasba","Nabinagar","Nasirnagar","Sarail","Ashuganj")),
            entry("chandpur", List.of("Chandpur Sadar","Faridganj","Haimchar","Haziganj","Kachua","Matlab (Uttar)","Matlab (Dakshin)","Shahrasti")),
            entry("comilla", List.of("Kotbari","Daudkandi","Chandina","Homna","Laksam","Muradnagar","Nangalkot","Titas","Meghna","Sadar Dakhshin","Sadar Uttar","Barura","Burichang","Chauddagram","Lalmai")),
            entry("cox's bazar", List.of("Cox's Bazar Sadar","Chakaria","Kutubdia","Maheshkhali","Pekua","Ramu","Teknaf","Ukhia")),
            entry("feni", List.of("Feni Sadar","Chhagalnaiya","Daganbhuiyan","Fulgazi","Parshuram","Sonagazi")),
            entry("khagrachhari", List.of("Khagrachhari Sadar","Dighinala","Lakshmichhari","Mahalchhari","Manikchhari","Matiranga","Panchhari","Ramgarh")),
            entry("lakshmipur", List.of("Lakshmipur Sadar","Kamalnagar","Raipur","Ramganj","Ramgati")),
            entry("noakhali", List.of("Noakhali Sadar","Begumganj","Chatkhil","Companiganj","Hatiya","Kabirhat","Senbagh","Sonaimuri","Subarnachar")),
            entry("rangamati", List.of("Rangamati Sadar","Baghaichhari","Barkal","Belaichhari","Juraichhari","Kaptai","Kawkhali","Langadu","Muktagachhara","Naniarchar","Rajasthali")),

            // Rajshahi division
            entry("rajshahi", List.of("Rajshahi Sadar","Bagha","Bagmara","Charghat","Durgapur","Godagari","Mohanpur","Paba","Puthia","Tanore")),
            entry("bogra", List.of("Bogra Sadar","Adamdighi","Dhunat","Dhupchanchia","Gabtali","Kahaloo","Nandigram","Sariakandi","Shajahanpur","Sherpur","Shibganj","Sonatola")),
            entry("chapainawabganj", List.of("Chapainawabganj Sadar","Bholahat","Gomastapur","Nachole","Rohanpur","Shibganj")),
            entry("joypurhat", List.of("Joypurhat Sadar","Akkelpur","Kalai","Khetlal","Panchbibi")),
            entry("naogaon", List.of("Naogaon Sadar","Atrai","Badalgachhi","Dhamoirhat","Mahadebpur","Niamatpur","Nitul","Porsha","Raninagar","Sapahar")),
            entry("natore", List.of("Natore Sadar","Bagatipara","Baraigram","Gurudaspur","Lalpur","Naldanga","Singra")),
            entry("nawabganj", List.of("Nawabganj Sadar","Bholahat","Gomastapur","Nachole","Shibganj")),
            entry("pabna", List.of("Pabna Sadar","Atgharia","Bera","Bhangura","Chatmohar","Faridpur","Iswardi","Santhia","Sujanagar")),
            entry("sirajganj", List.of("Sirajganj Sadar","Belkuchi","Chauhali","Kamarkhanda","Kazipur","Raiganj","Shahjadpur","Tarash","Ullapara")),

            // Khulna division
            entry("khulna", List.of("Khulna Sadar","Batiaghata","Dacope","Dighalia","Dumuria","Koyra","Mongla","Paikgachha","Phultala","Rupsha","Terokhada")),
            entry("bagerhat", List.of("Bagerhat Sadar","Chitalmari","Fakirahat","Kachua","Mollahat","Mongla","Morrelganj","Rampal","Sarankhola")),
            entry("chuadanga", List.of("Chuadanga Sadar","Alamdanga","Damurhuda","Jibannagar")),
            entry("jessore", List.of("Jessore Sadar","Bagherpara","Chaugachha","Jhikargachha","Keshabpur","Manirampur","Sharsha")),
            entry("jhenaidah", List.of("Jhenaidah Sadar","Harinakunda","Kaliganj","Kotchandpur","Maheshpur","Naldanga","Shailkupa")),
            entry("kushtia", List.of("Kushtia Sadar","Bheramara","Daulatpur","Khoksa","Kumarkhali","Mirpur")),
            entry("magura", List.of("Magura Sadar","Mohammadpur","Shalikha","Sreepur")),
            entry("meherpur", List.of("Meherpur Sadar","Gangni","Mujibnagar")),
            entry("narail", List.of("Narail Sadar","Kalia","Lohagara")),
            entry("satkhira", List.of("Satkhira Sadar","Assasuni","Debhata","Kalaroa","Kaliganj","Shyamnagar","Tala")),

            // Barisal division
            entry("barisal", List.of("Barisal Sadar","Agailjhara","Babuganj","Bakerganj","Banaripara","Gaurnadi","Hizla","Mehendiganj","Muladi","Wazirpur")),
            entry("barguna", List.of("Barguna Sadar","Amtali","Bamna","Betagi","Patharghata","Taltali")),
            entry("bhola", List.of("Bhola Sadar","Burhanuddin","Char Fasson","Daulatkhan","Lalmohan","Manpura","Tazumuddin")),
            entry("jhalokati", List.of("Jhalokati Sadar","Kathalia","Nalchiti","Rajapur")),
            entry("patuakhali", List.of("Patuakhali Sadar","Bauphal","Dashmina","Dumki","Galachipa","Kalapara","Mirzaganj","Rangabali")),
            entry("pirojpur", List.of("Pirojpur Sadar","Bhandaria","Kawkhali","Mathbaria","Nazirpur","Nesarabad (Swarupkathi)")),

            // Sylhet division
            entry("sylhet", List.of("Sylhet Sadar","Balaganj","Beanibazar","Bishwanath","Companiganj","Dakshin Surma","Fenchuganj","Golapganj","Gowainghat","Jaintiapur","Kanaighat","Osmaninagar","South Shillong","Zakiganj")),
            entry("habiganj", List.of("Habiganj Sadar","Ajmiriganj","Baniachong","Bahubal","Chunarughat","Deuli","Lakhai","Madhabpur","Nabiganj","Shaistaganj")),
            entry("moulvibazar", List.of("Moulvibazar Sadar","Barlekha","Kamalganj","Kulaura","Rajnagar","Sreemangal","Juri")),
            entry("sunamganj", List.of("Sunamganj Sadar","Bishwambharpur","Chhatak","Derai","Dharampasha","Dowarabazar","Jagannathpur","Jamalganj","Sulla","Tahirpur")),

            // Rangpur division
            entry("rangpur", List.of("Rangpur Sadar","Badarganj","Gangachhara","Kaunia","Mithapukur","Pirgachha","Pirganj","Taraganj")),
            entry("dinajpur", List.of("Dinajpur Sadar","Birampur","Birganj","Bochaganj","Chirirbandar","Fulbari","Ghoraghat","Hakimpur","Kaharole","Khansama","Nawabganj","Parbatipur")),
            entry("gaibandha", List.of("Gaibandha Sadar","Fulchhari","Gobindaganj","Palashbari","Sadullapur","Saghata","Sundarganj")),
            entry("kurigram", List.of("Kurigram Sadar","Bhurungamari","Char Rajibpur","Chilmari","Dushmara","Nageshwari","Phulbari","Rajarhat","Rangpur","Ulipur")),
            entry("lalmonirhat", List.of("Lalmonirhat Sadar","Aditmari","Hatibandha","Kaliganj","Patgram")),
            entry("nilphamari", List.of("Nilphamari Sadar","Dimla","Domar","Jaldhaka","Kishoreganj","Saidpur")),
            entry("panchagarh", List.of("Panchagarh Sadar","Atwari","Boda","Debiganj","Tentulia")),
            entry("thakurgaon", List.of("Thakurgaon Sadar","Baliadangi","Haripur","Pirganj","Ranisankail")),

            // Mymensingh division
            entry("mymensingh", List.of("Mymensingh Sadar","Bhaluka","Dhobaura","Fulbaria","Gafargaon","Gauripur","Haluaghat","Ishwarganj","Muktagachha","Nandail","Phulpur","Trisal")),
            entry("jamalpur", List.of("Jamalpur Sadar","Bakshiganj","Dewanganj","Islampur","Madarganj","Melandaha","Sarishabari")),
            entry("netrokona", List.of("Netrokona Sadar","Atpara","Barhatta","Durgapur","Khaliajuri","Kalmakanda","Kendua","Madan","Mohanganj","Purbadhala")),
            entry("sherpur", List.of("Sherpur Sadar","Jhenaigati","Nakla","Nalitabari","Sreebardi"))
    );

    private static Map.Entry<String, List<String>> entry(String k, List<String> v) {
        return Map.entry(k, v);
    }
}
