-- Migration to add Board Members and Who We Are content tables
-- Date: 2026-01-03

CREATE TABLE IF NOT EXISTS `board_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `english_name` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `who_we_are_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_type` varchar(100) NOT NULL COMMENT 'hero, section, features, voice, cta',
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert initial board members
INSERT INTO `board_members` (`name`, `english_name`, `position`, `bio`, `image_url`, `linkedin`, `twitter`, `order_index`) VALUES
('ዶ/ር ወርቁ ጋቸና', 'Dr. Werku Gachana', 'የ ኢትዮጵያ አርቴፊሽ ኢንስቲትዩት ስራ አስካሄጅ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ ሰብሳቢ', 'ዶ/ር ወርቁ ጋቸና የ ኢትዮጵያ አርቴፊሽ ኢንስቲትዩት ስራ አስካሄጅ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ ሰብሳቢ ናቸው።', '/images/mf.jpg', '#', 'https://x.com/muferihata', 1),
('አቶ እሱባለው በለጠ', 'Esubalew Belete', 'የኢንፎርሽን ቴክሎጂ ፓርክ ኮርፖሬሽን ዋና ስራ አስፈጸሚ', 'አቶ እሱባለው በለጠ የኢንፎርሽን ቴክሎጂ ፓርክ ኮርፖሬሽን ዋና ስራ አስፈጸሚ ሆነው በመስራት ላይ ይገኛሉ።', '/images/bele.png', 'https://www.linkedin.com/in/henok-ahmed/', 'https://x.com/henawa2000', 2),
('ዶ/ር ዘለቀ ተመስገን', 'Zeleke Temesgen', 'የኢትዮጵያ ኢንቨስትመንት ኮሚሽን ኮሚሽነር እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'ዶ/ር ዘለቀ ተመስገን በኢትዮጵያ ኢንቨስትመንት ኮሚሽን ኮሚሽነር ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/zeleke.jpg', '#', NULL, 3),
('ኢንጂነር ጌቱ ገረመው', 'Getu Geremew', 'የኢትዮጵያ ኤሌክትሪክ አገልግሎት ዋና ስራ አስፈጻሚ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'ኢንጂነር ጌቱ ገረመው በኢትዮጵያ ኤሌክትሪክ አገልግሎት ዋና ስራ አስፈጻሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/getu.jpg', '#', '#', 4),
('አቶ አያልህ ለማ', 'Ayalew Lema', 'የኢኖቬሽንና ቴክኖሎጂ ሚ/ር ሕግ ጉዳዮች ስራ አስፈጸሚና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'አቶ አያልህ ለማ በኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር ሕግ ጉዳዮች ስራ አስፈጸሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/bele.png', '#', NULL, 5),
('አቶ ባህሩ ዘይኑ', 'Bahru Zeynu', 'የዲጂታል ትራንስፎርሜሽን ኢትዮጵያ ማህበር ም/ፕሬዚዳንትና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'አቶ ባህሩ ዘይኑ በዲጂታል ትራንስፎርሜሽን ኢትዮጵያ ማህበር ም/ፕሬዚዳንት ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/bahru.jpg', 'https://www.linkedin.com/in/baheru-zeyenu/', '#', 6),
('አቶ ሰለሞን አማረ', 'Solomon Amare', 'የአዲስ አበባ ከተማ አስተዳደር የኢኖቬሽንና ቴክኖሎጂ ልማት ቢሮ ኃላፊ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'አቶ ሰለሞን አማረ በአዲስ አበባ ከተማ አስተዳደር የኢኖቬሽንና ቴክኖሎጂ ልማት ቢሮ ኃላፊ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/belete.png', '#', NULL, 7),
('ወ/ሮ ሂሩት መብራቴ', 'Hirut Mebrate', 'የገቢዎች ሚ/ር ጽ/ቤት ኃላፊ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'ወ/ሮ ሂሩት መብራቴ በገቢዎች ሚኒስቴር ጽ/ቤት ኃላፊ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/hirut.jpg', '#', '#', 8),
('አቶ ጌታቸው ነገራ', 'Getachew Negera', 'የገንዘብ ሚኒስቴር የፊስካል ጉዳዮች ዘርፍ አማካሪ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'አቶ ጌታቸው ነገራ በገንዘብ ሚኒስቴር የፊስካል ጉዳዮች ዘርፍ አማካሪ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/belete.png', '#', NULL, 9),
('አቶ መርሶ ጎበና', 'Merso Gobena', 'የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ሰራተኞች ተወካይና ስራ አመራር ቦርድ አባል', 'አቶ መርሶ ጎበና የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ሰራተኞች ተወካይ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/images/merso.jpg', '#', NULL, 10),
('ክቡር አቶ እንዳለው መኮንን', 'Endalew Mekonnen', 'የንግድና ቀጣናዊ ትስስር ሚ/ር ዲኤታ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ ም/ሰብሳቢ', 'ክቡር አቶ እንዳለው መኮንን በኢትዮጵያ የንግድና ቀጣናዊ ትስስር ሚኒስቴር ዲኤታ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ ም/ሰብሳቢ ናቸው።', '/images/endalew.jpg', '#', '#', 11),
('አቶ ዮሴፍ ክንፈ', 'Yosef Kinfe', 'የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ስራ አመራር ቦርድ ፀሃፊ', 'አቶ ዮሴፍ ክንፈ የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ስራ አመራር ቦርድ ፀሃፊ ሆነው በመስራት ላይ ይገኛሉ።', '/images/belete.png', '#', NULL, 12);

-- Insert who we are sections
INSERT INTO `who_we_are_sections` (`section_type`, `title`, `subtitle`, `content`, `image_url`, `order_index`) VALUES
('hero', 'We Are Ethiopian IT Park', 'The beating heart of Ethiopia\'s digital revolution — a world-class technology hub empowering innovation, entrepreneurship, and economic growth.', NULL, NULL, 0),
('section', 'Who We Are', 'We are a government-supported, future-driven ICT hub located in Addis Ababa, designed to be the digital backbone of Ethiopia\'s transformation. At Ethiopian IT Park, we nurture the next generation of tech leaders, startups, and investors who are shaping Africa\'s digital future.', NULL, 'https://res.cloudinary.com/yesuf/image/upload/v1747135433/Incubation_euahej.png', 1),
('section', 'What We Stand For', NULL, '<ul><li><strong>Innovation</strong> – We foster creative solutions that solve real-world problems.</li><li><strong>Inclusion</strong> – We believe technology should empower all Ethiopians, everywhere.</li><li><strong>Collaboration</strong> – We bridge government, academia, industry, and investors.</li><li><strong>Impact</strong> – We aim to create jobs, attract investment, and scale digital capabilities.</li></ul>', '/images/home/stand-for.jpg', 2),
('features', 'What Makes Us Unique?', NULL, '[{\"title\": \"National-Level Initiative\", \"desc\": \"Backed by Ethiopia\'s digital transformation agenda\"}, {\"title\": \"Full-Scale Infrastructure\", \"desc\": \"Cloud, co-working, incubation, and enterprise zones\"}, {\"title\": \"Startup & SME Support\", \"desc\": \"Incubation, mentoring, and market access for local innovators\"}, {\"title\": \"Gateway to Africa\", \"desc\": \"Strategic hub for East Africa\'s growing tech market\"}, {\"title\": \"Investment Linkages\", \"desc\": \"Connecting global investors with high-potential African tech ventures\"}]', '/images/home/makes-unique.jpg', 3),
('section', 'Our Role in Digital Ecosystem', NULL, '<ul><li>Startups are born</li><li>Innovations thrive</li><li>Global partnerships begin</li><li>Jobs are created</li><li>Ideas become products</li></ul>', '/images/home/our-role.jpg', 4),
('voice', NULL, '\"We are here to lead Ethiopia\'s future with innovation, knowledge, and collaboration.\"', NULL, NULL, 5);
