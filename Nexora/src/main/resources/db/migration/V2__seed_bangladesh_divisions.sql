-- ============================================================
-- V2: Seed Bangladesh Divisions (8) and Districts (64)
-- Thanas will be inserted via a programmatic seeder
-- (BangladeshThanaSeeder) to keep this migration concise.
-- ============================================================

INSERT INTO divisions (name, bn_name) VALUES
 ('Dhaka',      'ঢাকা'),
 ('Chittagong', 'চট্টগ্রাম'),
 ('Rajshahi',   'রাজশাহী'),
 ('Khulna',     'খুলনা'),
 ('Barisal',    'বরিশাল'),
 ('Sylhet',     'সিলেট'),
 ('Rangpur',    'রংপুর'),
 ('Mymensingh', 'ময়মনসিংহ');

-- Dhaka Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Dhaka',         'ঢাকা',          (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Faridpur',      'ফরিদপুর',       (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Gazipur',       'গাজীপুর',       (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Gopalganj',     'গোপালগঞ্জ',      (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Kishoreganj',   'কিশোরগঞ্জ',     (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Madaripur',     'মাদারীপুর',     (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Manikganj',     'মানিকগঞ্জ',      (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Munshiganj',    'মুন্সিগঞ্জ',     (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Narayanganj',   'নারায়ণগঞ্জ',    (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Narsingdi',     'নরসিংদী',       (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Rajbari',       'রাজবাড়ী',       (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Shariatpur',    'শরীয়তপুর',     (SELECT id FROM divisions WHERE name='Dhaka')),
 ('Tangail',       'টাঙ্গাইল',       (SELECT id FROM divisions WHERE name='Dhaka'));

-- Chittagong Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Chittagong',     'চট্টগ্রাম',       (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Bandarban',      'বান্দরবান',        (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Brahmanbaria',   'ব্রাহ্মণবাড়িয়া', (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Chandpur',       'চাঁদপুর',          (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Comilla',        'কুমিল্লা',         (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Cox''s Bazar',   'কক্সবাজার',       (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Feni',           'ফেনী',             (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Khagrachhari',   'খাগড়াছড়ি',       (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Lakshmipur',     'লক্ষ্মীপুর',       (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Noakhali',       'নোয়াখালী',        (SELECT id FROM divisions WHERE name='Chittagong')),
 ('Rangamati',      'রাঙ্গামাটি',       (SELECT id FROM divisions WHERE name='Chittagong'));

-- Rajshahi Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Rajshahi',       'রাজশাহী',         (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Bogra',          'বগুড়া',           (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Chapainawabganj','চাঁপাইনবাবগঞ্জ', (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Joypurhat',      'জয়পুরহাট',        (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Naogaon',        'নওগাঁ',            (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Natore',         'নাটোর',           (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Nawabganj',      'নবাবগঞ্জ',         (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Pabna',          'পাবনা',            (SELECT id FROM divisions WHERE name='Rajshahi')),
 ('Sirajganj',      'সিরাজগঞ্জ',        (SELECT id FROM divisions WHERE name='Rajshahi'));

-- Khulna Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Khulna',         'খুলনা',            (SELECT id FROM divisions WHERE name='Khulna')),
 ('Bagerhat',       'বাগেরহাট',         (SELECT id FROM divisions WHERE name='Khulna')),
 ('Chuadanga',      'চুয়াডাঙ্গা',       (SELECT id FROM divisions WHERE name='Khulna')),
 ('Jessore',        'যশোর',             (SELECT id FROM divisions WHERE name='Khulna')),
 ('Jhenaidah',      'ঝিনাইদহ',          (SELECT id FROM divisions WHERE name='Khulna')),
 ('Kushtia',        'কুষ্টিয়া',         (SELECT id FROM divisions WHERE name='Khulna')),
 ('Magura',         'মাগুরা',           (SELECT id FROM divisions WHERE name='Khulna')),
 ('Meherpur',       'মেহেরপুর',         (SELECT id FROM divisions WHERE name='Khulna')),
 ('Narail',         'নড়াইল',            (SELECT id FROM divisions WHERE name='Khulna')),
 ('Satkhira',       'সাতক্ষীরা',         (SELECT id FROM divisions WHERE name='Khulna'));

-- Barisal Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Barisal',        'বরিশাল',          (SELECT id FROM divisions WHERE name='Barisal')),
 ('Barguna',        'বরগুনা',           (SELECT id FROM divisions WHERE name='Barisal')),
 ('Bhola',          'ভোলা',             (SELECT id FROM divisions WHERE name='Barisal')),
 ('Jhalokati',      'ঝালকাঠি',          (SELECT id FROM divisions WHERE name='Barisal')),
 ('Patuakhali',     'পটুয়াখালী',       (SELECT id FROM divisions WHERE name='Barisal')),
 ('Pirojpur',       'পিরোজপুর',        (SELECT id FROM divisions WHERE name='Barisal'));

-- Sylhet Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Sylhet',         'সিলেট',            (SELECT id FROM divisions WHERE name='Sylhet')),
 ('Habiganj',       'হবিগঞ্জ',          (SELECT id FROM divisions WHERE name='Sylhet')),
 ('Moulvibazar',    'মৌলভীবাজার',       (SELECT id FROM divisions WHERE name='Sylhet')),
 ('Sunamganj',      'সুনামগঞ্জ',         (SELECT id FROM divisions WHERE name='Sylhet'));

-- Rangpur Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Rangpur',        'রংপুর',            (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Dinajpur',       'দিনাজপুর',          (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Gaibandha',      'গাইবান্ধা',          (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Kurigram',       'কুড়িগ্রাম',        (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Lalmonirhat',    'লালমনিরহাট',        (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Nilphamari',     'নীলফামারী',         (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Panchagarh',     'পঞ্চগড়',            (SELECT id FROM divisions WHERE name='Rangpur')),
 ('Thakurgaon',     'ঠাকুরগাঁও',         (SELECT id FROM divisions WHERE name='Rangpur'));

-- Mymensingh Division
INSERT INTO districts (name, bn_name, division_id) VALUES
 ('Mymensingh',     'ময়মনসিংহ',        (SELECT id FROM divisions WHERE name='Mymensingh')),
 ('Jamalpur',       'জামালপুর',          (SELECT id FROM divisions WHERE name='Mymensingh')),
 ('Netrokona',      'নেত্রকোনা',         (SELECT id FROM divisions WHERE name='Mymensingh')),
 ('Sherpur',        'শেরপুর',            (SELECT id FROM divisions WHERE name='Mymensingh'));
