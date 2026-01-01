-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 31, 2025 at 05:11 AM
-- Server version: 10.6.24-MariaDB
-- PHP Version: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `starteut_itp_cms`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) DEFAULT NULL,
  `tracking_code` varchar(20) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `work_experience` text DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `status` enum('pending','reviewing','shortlisted','written_exam','interview_shortlisted','interviewing','offered','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `appointment_location` varchar(255) DEFAULT NULL,
  `appointment_lat` decimal(10,8) DEFAULT NULL,
  `appointment_lng` decimal(11,8) DEFAULT NULL,
  `appointment_map_link` text DEFAULT NULL,
  `appointment_details` text DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_code` (`tracking_code`),
  KEY `job_id` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=3;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `job_id`, `tracking_code`, `full_name`, `gender`, `email`, `phone`, `address`, `linkedin`, `portfolio`, `resume_path`, `cover_letter`, `education`, `work_experience`, `skills`, `status`, `admin_notes`, `appointment_date`, `appointment_time`, `appointment_location`, `appointment_lat`, `appointment_lng`, `appointment_map_link`, `appointment_details`, `applied_at`, `updated_at`) VALUES
(1, 2, 'ITPC-5C8C52', 'hayal', NULL, 'hayaltamrat@gmail.com', '0912221212', 'ADDIS ABABA', NULL, 'https://hayal-tamrat.wingtechai.com/', 'D:\\itpccms\\backend\\ITPCMS\\backend\\uploads\\resumes\\resume-1766390217516.docx', 'What is Lorem Ipsum?\r\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\r\n\r\nWhy do we use it?\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n\r\n', NULL, NULL, NULL, 'written_exam', 'local time @2:00', '2025-12-23', '19:28:00', '', 8.96623744, 38.84075825, '', 'Bring Nid ', '2025-12-22 07:56:57', '2025-12-22 09:28:02'),
(2, 1, 'ITPC-F0822A', 'hayal', 'Male', 'hayaltamrat@gmail.com', '0912221212', 'ADDIS ABABA', NULL, 'https://hayal-tamrat.wingtechai.com/', 'D:\\itpccms\\backend\\ITPCMS\\backend\\uploads\\resumes\\resume-1766391039794.docx', 'What is Lorem Ipsum?\r\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\r\n\r\nWhy do we use it?\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n\r\n', '[{\"id\":\"1766390974653\",\"institutionName\":\"Hawassa U\",\"degree\":\"Msc\",\"fieldOfStudy\":\"IT\",\"graduationYear\":\"2021\",\"gpa\":\"3.4\"}]', '[{\"id\":\"1766390935886\",\"companyName\":\"ITP\",\"jobTitle\":\"developer\",\"startDate\":\"2023-02\",\"endDate\":\"\",\"isCurrent\":true,\"responsibilities\":\"What is Lorem Ipsum?\\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\\n\\nWhy do we use it?\\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\\n\\n\"}]', '[]', 'interview_shortlisted', 'Local time @2:00 monday morning', '2026-01-01', '10:15:00', 'Encubation Building G+5', 8.96468219, 38.84064005, '', 'Bring Your NID', '2025-12-22 08:10:39', '2025-12-22 11:14:03');

-- --------------------------------------------------------

--
-- Table structure for table `approvalhierarchy`
--

CREATE TABLE `approvalhierarchy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `next_role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `news_item_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `news_item_id` (`news_item_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=17;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `news_item_id`, `parent_id`, `name`, `email`, `text`, `created_at`, `approved`) VALUES
(1, 9, NULL, 'hayal', 'hayal@gmail.com', 'something', '2025-05-12 18:08:22', 1),
(14, 13, NULL, 'hayal', 'hayalt@gmail.com', 'test', '2025-12-18 16:40:19', 0),
(15, 13, NULL, 'ሃያል', 'hayaltamrat@gmail.com', 'እጅግ ደስ የሚያሰኝ ነው።', '2025-12-22 17:54:20', 1),
(16, 13, 15, 'Admin', 'admin@itpark.com', 'እናመሰግናልን።', '2025-12-22 17:55:44', 1);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=2;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `message`, `status`, `created_at`) VALUES
(1, 'Beki Tame', 'berekettamrat2015@gmail.com', '+251913566735', 'some thing ', 'read', '2025-12-19 11:32:58');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `fname` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `employees_ibfk_2` (`department_id`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=87;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `name`, `role_id`, `department_id`, `supervisor_id`, `fname`, `lname`, `email`, `phone`, `sex`) VALUES
(21, 'www www', 1, 1, NULL, 'hayal', 'tamrat', NULL, '0916048977', NULL),
(34, 'hayaltame', NULL, 2, 21, 'ggg', 'ggg', 'beki@gmail.com', '0934556621', 'F'),
(36, 'hayaltame', NULL, 2, 0, 'some', 'one', 'bekeei@gmail.com', '0934556621', 'M'),
(37, 'hayaltame111', 1, NULL, NULL, 'some11', 'tame', 'oneq@gmail.com', '0934556688', 'M'),
(38, 'hayaltame3333', 1, NULL, NULL, 'aaa', 'a', 'one1a111@gmail.com', '0934556111', 'M'),
(39, 'hayaltame1114444', 1, NULL, NULL, 'some00', 'one11', 'one222@gmail.com', '0934556688', 'M'),
(40, 'hayaltame1114444444', 1, NULL, NULL, 'yeab444', 'one4444', 'beki444@gmail.com', '0934556444', 'M'),
(41, 'hayaltame444', 1, NULL, NULL, 'yeabeee', 'eeee', 'eeeee@gmail.com', '0934556644', 'M'),
(43, 'rtttttt44', 1, NULL, NULL, 'yeabeee', 'eeee', 'eeee44e@gmail.com', '0934556677', 'M'),
(45, 'tttttttttttt111', 1, NULL, NULL, 'yeabrrr', 'tamer', 'onerrr@gmail.com', '0934556655', 'M'),
(46, 'bekele woya', 8, NULL, NULL, 'bekele', 'woya', 'woya@gmail.com', '0933499094', 'M'),
(47, 'admin admin', 1, 2, 1, 'admin', 'admin', 'admin@email.com', '123-456-7890', 'M'),
(48, 'hylt', 8, NULL, 0, 'hl', 'tm', 'hl@gmail.com', '0934556644', 'M'),
(49, 'yonas', 2, NULL, NULL, 'yonas', 'ceo', 'yonas@itp.org', '0933499093', 'M'),
(50, 'simegn', 5, 2, 49, 'geter', 'geter', 'simegn@itp.org', '0933499094', 'M'),
(51, 'hayal@itp.org', 8, 2, 50, 'hayal', 'hayal', 'hayal@itp.org', '0933499097', 'M'),
(54, 'hayalt@itp.org', 8, 2, 0, 'hayalt', 'hayalt', 'hayalt@itp.org', '0933499097', 'M'),
(55, 'abebe', 4, NULL, 0, 'abebe', 'abe', 'abe@itp.et', '0934556624', 'M'),
(56, '333333333', 4, 2, 49, 'some00333333', 'one333333', 'beki33333333333@gmail.com', '0934556333', 'M'),
(57, 'staf', 8, 2, 56, 'staf', 'staf', 'staf@gmail.com', '0934556688', 'M'),
(58, 'nebyat', 6, 2, 50, 'nebyat', 'nebyat', 'nebyat@itp.et', '093455444', 'F'),
(59, 'ewunetu', 7, 2, 58, 'ewunetu', 'ewunetu', 'ewunetu@itp.et', '0934556453', 'M'),
(60, 'general', 3, NULL, 49, 'general', 'manager', 'manager@itp.et', '0933499366', 'M'),
(62, 'staf1', 8, 2, 66, 'staf1', 'staf1', 'staf1@itp.et', '0934556688', 'M'),
(63, 'hayalta4444', 6, 2, 50, 'some', 'one', 'berrrrrki@gmail.com', '0934556555', 'M'),
(64, 'yeabeeeee', 1, NULL, NULL, 'some', 'one', 'eeee@gmail.com', '0934556688', 'M'),
(65, 'team leader', 7, 2, 58, 'teaml', 'teaml', 'teaml@gmail.com', '09373773333', 'M'),
(66, 'team leader', 7, 2, 58, 'teamleader', 'teamleader', 'teamleader@gmail.com', '09373773333', 'M'),
(67, 'hayal', 1, NULL, NULL, 'hayal', 'tamrat', 'hayal@itp.it', '0916048977', 'M'),
(68, 'hayal', 8, 2, 65, 'hayal', 'tamrat', 'hayalt@itp.it', '0916048977', 'M'),
(69, 'registrar@gmail.com', 5, NULL, NULL, 'registrar', 'registrar', 'registrar@gmail.com', '0916048977', 'M'),
(70, 'Nathan', 1, NULL, NULL, 'Hayal', 'Girum', 'nathan@itp.et', '0976180462', 'M'),
(71, 'Hayal Tamrat Girum', 3, NULL, NULL, 'Hayal', 'Girum', 'hayal@gmai.com', '0976180462', 'M'),
(72, 'nathay tamrat', 5, NULL, 70, 'hayal', 'tamrat', 'regist@bus.com', '0916048977', 'M'),
(73, 'hayal tamrat', 1, NULL, NULL, 'nathay', 'tamrat', 'astu@nathayblog.com', '0916048977', 'M'),
(75, 'hayal tamrat', 4, NULL, 70, 'nathay', 'tamrat', 'hager@temechain.com', '0916048977', 'M'),
(78, 'hayal tamrat', 4, NULL, 70, 'nathay', 'tamrat', 'hager1@temechain.com', '0916048977', 'M'),
(82, 'hayal tamrat', 4, 1, 49, 'hayal', 'tamrat', 'hager22@temechain.com', '0916048977', 'M'),
(83, 'Hayal Tamrat', 5, NULL, NULL, 'Hayal', 'Tamrat', 'Hayalt@hu.edu.et', '0916048977', 'M'),
(84, 'Hayal ', 1, NULL, NULL, 'Nathay ', 'Nathay ', 'Nathantamrat50@gmail.com', '90188837377', 'M'),
(85, 'nathay tamrat', 5, NULL, NULL, 'nathay', 'tamrat', 'astu@nathayblog.et', '0916048977', 'M'),
(86, 'agent', 6, NULL, 50, 'agent', 'agent', 'agent@lonche.com', 'itp@123', 'M');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `venue` varchar(255) NOT NULL,
  `image` varchar(2048) NOT NULL,
  `description` text NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `registrationLink` varchar(2048) DEFAULT NULL,
  `capacity` varchar(100) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `youtubeUrl` varchar(2048) DEFAULT NULL,
  `imageAltText` text DEFAULT NULL,
  `comments` int(11) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=6;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `date`, `time`, `venue`, `image`, `description`, `featured`, `registrationLink`, `capacity`, `tags`, `youtubeUrl`, `imageAltText`, `comments`, `createdAt`, `updatedAt`) VALUES
(5, 'ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው', '2025-12-21', '22:48:00', 'ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው', '/uploads/1766411455580-photo_2025-12-22_22-43-39 (2).jpg', '<p>ይህ የ 2030 የዲጂታል ኢትዮጵያ ሎጎ ነው</p>', 0, '', '0', '[]', NULL, NULL, 0, '2025-12-22 13:50:07', '2025-12-22 13:50:55');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=6;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `order`, `created_at`, `updated_at`) VALUES
(1, 'What is Ethiopian IT Park?', 'Ethiopian IT Park is a state-of-the-art technology hub designed to foster innovation and digital transformation in Ethiopia. Our facility provides world-class infrastructure, support services, and a collaborative environment for tech companies, startups, and entrepreneurs.', 'about', 1, '2025-12-19 09:01:59', '2025-12-19 09:01:59'),
(2, 'What services does IT Park offer to businesses?', 'We offer a comprehensive range of services including: modern office spaces, high-speed internet connectivity, 24/7 power backup, incubation programs, business development support, meeting and conference facilities, and networking opportunities with industry leaders.', 'services', 2, '2025-12-19 09:01:59', '2025-12-19 09:01:59'),
(3, 'How can I invest in Ethiopian IT Park?', 'Investment opportunities at Ethiopian IT Park are open to both local and international investors. The process involves: 1) Submitting an investment proposal, 2) Due diligence review, 3) Approval process, 4) Space allocation and setup. Contact our investment team for detailed information and guidance.', 'investment', 3, '2025-12-19 09:01:59', '2025-12-19 09:01:59'),
(4, 'What are the working hours?', 'The IT Park facility is open 24/7 for registered companies. Administrative offices operate Monday through Friday, 8:30 AM to 5:30 PM EAT.', 'about', 4, '2025-12-19 09:01:59', '2025-12-19 09:01:59'),
(5, 'Is there public transportation to the park?', 'Yes, we have dedicated shuttle services from major hubs in Addis Ababa. Additionally, the park is accessible via public buses and ride-hailing services.', 'community', 5, '2025-12-19 09:01:59', '2025-12-19 09:01:59');

-- --------------------------------------------------------

--
-- Table structure for table `incubation_programs`
--

CREATE TABLE `incubation_programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=4;

--
-- Dumping data for table `incubation_programs`
--

INSERT INTO `incubation_programs` (`id`, `title`, `icon`, `description`, `link`, `created_at`) VALUES
(1, 'Startup Support', 'FaRocket', 'Office spaces, mentorship, and pitch events to accelerate your growth journey.', '/incubation/startups', '2025-12-23 08:00:18'),
(2, 'Capacity Building', 'FaGraduationCap', 'Intensive workshops, bootcamps, and training programs to upskill your team.', '/incubation/training', '2025-12-23 08:00:18'),
(3, 'Innovation Labs', 'FaLaptopCode', 'Access to state-of-the-art labs, funding, and corporate collaborations.', '/incubation/innovation-programs', '2025-12-23 08:00:18');

-- --------------------------------------------------------

--
-- Table structure for table `incubation_success_stories`
--

CREATE TABLE `incubation_success_stories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`description`)),
  `stats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stats`)),
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=4;

--
-- Dumping data for table `incubation_success_stories`
--

INSERT INTO `incubation_success_stories` (`id`, `image_url`, `title`, `description`, `stats`, `link`, `created_at`) VALUES
(1, '/uploads/incubation/1766477710201.jpg', 'IE Network Solutions', '[\"A leading tech company delivering impactful solutions.\",\"Award-winning digital transformation partner.\"]', '[{\"number\":\"250+\",\"label\":\"Completed Projects\"},{\"number\":\"200+\",\"label\":\"Clients Served\"},{\"number\":\"500M+ ETB\",\"label\":\"Annual Revenue\"}]', '/incubation/startups/success', '2025-12-23 08:00:18'),
(2, 'https://res.cloudinary.com/yesuf/image/upload/v1747295344/kagool_ev8nkh.jpg', 'Kagool PLC', '[\"A leading global data & analytics consultancy, delivering digital transformation for enterprises.\", \"Located at 2nd Floor, BPO Building, Information Technology Park, Addis Ababa, Ethiopia.\", \"Discover more on their website: kagool.com/about-us\"]', '[{\"number\": \"Global\", \"label\": \"Presence\"}, {\"number\": \"20+ Years\", \"label\": \"Experience\"}]', 'https://www.kagool.com/about-us', '2025-12-23 08:00:18'),
(3, 'https://res.cloudinary.com/yesuf/image/upload/v1747295683/unin_duld3y.jpg', 'UNIDO Ethiopia', '[\"The United Nations Industrial Development Organization (UNIDO) drives inclusive and sustainable industrial development.\", \"Active in Ethiopia’s IT Park, supporting innovation and industrial growth.\", \"Learn more: unido.org/about-us/who-we-are\"]', '[{\"number\": \"170+\", \"label\": \"Member States\"}, {\"number\": \"1966\", \"label\": \"Established\"}]', 'https://www.unido.org/about-us/who-we-are', '2025-12-23 08:00:18');

-- --------------------------------------------------------

--
-- Table structure for table `investment_resources`
--

CREATE TABLE `investment_resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT 'FaFileAlt',
  `file_url` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'document',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=6;

--
-- Dumping data for table `investment_resources`
--

INSERT INTO `investment_resources` (`id`, `label`, `icon`, `file_url`, `type`, `created_at`) VALUES
(1, 'Business Templates', 'FaFileAlt', '/docs/business-templates.zip', 'zip', '2025-12-23 09:48:57'),
(2, 'Registration Forms', 'FaFileSignature', '/docs/registration-forms.zip', 'zip', '2025-12-23 09:48:57'),
(3, 'Legal Guidelines', 'FaGavel', '/docs/legal-guidelines.pdf', 'pdf', '2025-12-23 09:48:57'),
(4, 'Zone Maps (PDF)', 'FaMapMarkedAlt', '/docs/zone-maps.pdf', 'pdf', '2025-12-23 09:48:57'),
(5, 'Tax & Policy Summary', 'FaRegLightbulb', '/docs/tax-policy-summary.pdf', 'pdf', '2025-12-23 09:48:57');

-- --------------------------------------------------------

--
-- Table structure for table `investment_steps`
--

CREATE TABLE `investment_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `step_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `doc_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=7;

--
-- Dumping data for table `investment_steps`
--

INSERT INTO `investment_steps` (`id`, `step_number`, `title`, `description`, `doc_url`, `status`, `created_at`) VALUES
(1, 1, 'Submit Expression of Interest', 'Begin your journey with a short online form outlining your business scope and interest.', '/docs/expression-of-interest.pdf', 'active', '2025-12-23 09:48:57'),
(2, 2, 'Initial Consultation', 'Our investment experts will connect with you to understand your goals and explain tailored opportunities.', '/docs/initial-consultation.pdf', 'active', '2025-12-23 09:48:57'),
(3, 3, 'Proposal Submission', 'Submit a detailed proposal. Templates and support documents are available for download.', '/docs/proposal-template.pdf', 'active', '2025-12-23 09:48:57'),
(4, 4, 'Site Allocation & Licensing', 'Choose your preferred zone (BPO, Software Dev, AI, etc.) and receive guidance on securing legal licensing.', '/docs/site-allocation-guide.pdf', 'active', '2025-12-23 09:48:57'),
(5, 5, 'Legal Setup & Registration', 'Company registration, MoU signing, and onboarding with our regulatory support desk.', '/docs/legal-setup-checklist.pdf', 'active', '2025-12-23 09:48:57'),
(6, 6, 'Operational Kick-off', 'Begin setting up infrastructure, recruiting local talent, and accessing park resources.', '/docs/operational-kickoff.pdf', 'active', '2025-12-23 09:48:57');

-- --------------------------------------------------------

--
-- Table structure for table `investors`
--

CREATE TABLE `investors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `investor_id` varchar(50) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `property_name` varchar(255) DEFAULT NULL,
  `industry_type` varchar(100) DEFAULT NULL,
  `availability_status` varchar(100) DEFAULT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `investment_type` varchar(100) DEFAULT NULL,
  `established_date` date DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `investor_id` (`investor_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=2;

--
-- Dumping data for table `investors`
--

INSERT INTO `investors` (`id`, `investor_id`, `company_name`, `property_name`, `industry_type`, `availability_status`, `zone`, `country`, `description`, `contact_name`, `contact_phone`, `investment_type`, `established_date`, `website`, `image`, `meta_title`, `meta_description`, `meta_keywords`, `slug`, `linkedin`, `twitter`, `facebook`, `created_at`, `updated_at`, `gallery`) VALUES
(1, '1', 'IE Network Solutions', 'Private', 'Technology ', 'Active', 'IT Park, Addis Ababa', 'Ethiopia', 'IE Networks was established in December 2008 and has been involved exclusively in the areas ranging from enterprise network services and business automation intelligence to smart infrastructure and cloud services.', 'Merid', '0913566735', 'IT Infrastructure and Development', '2021-01-21', 'https://www.ienetworksolutions.com/', '/uploads/partners-investors/image-1766430748325-659634768.jpg', 'E Network Solutions | Leading Enterprise IT & Managed Services in Ethiopia', 'With 17+ years of expertise, IE Network Solutions PLC provides end-to-end IT infrastructure, cloud migration, and cybersecurity for Ethiopia’s top government and financial institutions.', 'IE Network Solutions PLC, IE Networks Ethiopia, Meried Bekele IE Networks.', 'IE Network Solution ', 'https://et.linkedin.com/company/ie-network-solutions', 'https://x.com/IE_Networks', 'https://web.facebook.com/ienetworksolutions', '2025-12-22 19:12:28', '2025-12-23 07:21:20', '[\"/uploads/partners-investors/gallery-1766473094500-348102720.jpg\",\"/uploads/partners-investors/gallery-1766473094503-430791884.jpg\",\"/uploads/partners-investors/gallery-1766473094506-86678640.jpg\",\"/uploads/partners-investors/gallery-1766473094518-44877225.jpg\",\"/uploads/partners-investors/gallery-1766473094521-862508506.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `type` enum('Full-time','Part-time','Contract','Internship') DEFAULT 'Full-time',
  `description` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `qualifications` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=3;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `title`, `department`, `location`, `type`, `description`, `responsibilities`, `qualifications`, `start_date`, `deadline`, `status`, `created_at`, `updated_at`) VALUES
(1, 'software developer', 'software development', 'Addis Ababa - Goro (IT PARK)', 'Full-time', 'Job Description:\n\nWe are looking for a skilled and motivated Software Developer to join our team. The ideal candidate will be responsible for designing, developing, testing, and maintaining software applications that meet user and business requirements.\n\nWhat We Offer:\n\nCompetitive salary\n\nProfessional growth and learning opportunities\n\nFriendly and collaborative work environment\n\nFlexible working options (if applicable)', '[\"Key Responsibilities:\",\"\",\"Design, develop, and maintain web or mobile applications\",\"\",\"Write clean, efficient, and well-documented code\",\"\",\"Collaborate with designers, project managers, and other developers\",\"\",\"Debug, test, and improve application performance\",\"\",\"Participate in code reviews and follow best development practices\",\"\",\"Maintain and update existing systems as needed\"]', '[\"Required Skills & Qualifications:\",\"\",\"Bachelor’s degree in Computer Science, Software Engineering, or related field (or equivalent experience)\",\"\",\"Experience with programming languages such as JavaScript, Python, Java, or C#\",\"\",\"Knowledge of web technologies (HTML, CSS, React, Node.js, etc.)\",\"\",\"Understanding of databases (MySQL, PostgreSQL, MongoDB, etc.)\",\"\",\"Familiarity with version control systems (Git)\",\"\",\"Strong problem-solving and analytical skills\"]', '2025-12-23', '2025-12-25', 'published', '2025-12-22 07:43:26', '2025-12-22 19:39:15'),
(2, 'Senior Software Engineer (Full Stack)', 'Engineering', 'Addis Ababa, Ethiopia', 'Full-time', 'We are looking for a world-class Full Stack Engineer to build the future of our digital infrastructure.', '[\"Architect scalable microservices\",\"Lead frontend modernization\",\"Optimize DB performance\"]', '[\"5+ years React/Node experience\",\"Strong SQL skills\",\"Cloud native mindset\"]', '2025-12-09', '2025-12-22', 'published', '2025-12-22 07:51:32', '2025-12-22 19:39:59');

-- --------------------------------------------------------

--
-- Table structure for table `land_zones`
--

CREATE TABLE `land_zones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_size_sqm` decimal(15,2) DEFAULT 0.00,
  `available_size_sqm` decimal(15,2) DEFAULT 0.00,
  `icon_name` varchar(100) DEFAULT 'FaGlobeAfrica',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=5;

--
-- Dumping data for table `land_zones`
--

INSERT INTO `land_zones` (`id`, `name`, `description`, `total_size_sqm`, `available_size_sqm`, `icon_name`, `created_at`, `updated_at`) VALUES
(1, 'IT Business Zone', 'Primary zone for IT companies and service providers with advanced infrastructure.', 50000.00, 35000.00, 'FaGlobeAfrica', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
(2, 'Commercial Zone', 'Designed for business support services, shopping areas, and commercial hubs.', 30000.00, 12000.00, 'FaGlobeAfrica', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
(3, 'Manufacturing Zone', 'Zone for light industrial and tech manufacturing with large-scale utility support.', 80000.00, 45000.00, 'FaGlobeAfrica', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
(4, 'Knowledge Zone', 'Focus area for research, training centers, and academic-industry collaborations.', 40000.00, 28000.00, 'FaGlobeAfrica', '2025-12-21 14:56:49', '2025-12-21 14:56:49');

-- --------------------------------------------------------

--
-- Table structure for table `leased_lands`
--

CREATE TABLE `leased_lands` (
  `id` varchar(50) NOT NULL,
  `zone_id` int(11) NOT NULL,
  `land_type` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `size_sqm` decimal(15,2) NOT NULL,
  `available_size_sqm` decimal(15,2) DEFAULT 0.00,
  `status` enum('Available','Leased') DEFAULT 'Available',
  `leased_by` varchar(255) DEFAULT NULL,
  `leased_from` date DEFAULT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `zone_id` (`zone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leased_lands`
--

INSERT INTO `leased_lands` (`id`, `zone_id`, `land_type`, `location`, `size_sqm`, `available_size_sqm`, `status`, `leased_by`, `leased_from`, `contact_name`, `contact_phone`, `created_at`, `updated_at`) VALUES
('LND-ICTA-202', 1, 'Commercial', 'Behind ICT Tower A', 1500.00, 1200.00, 'Available', NULL, '2025-06-01', 'Belete Esubalew', '+251913456789', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
('LND-ICTA-203', 2, 'Commercial', 'East Wing, ICT Park', 2200.00, 0.00, 'Leased', 'TechEthiopia Solutions', '2025-01-15', 'Belete Esubalew', '+251911234567', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
('LND-ICTA-204', 3, 'Industrial', 'Near Main Entrance', 3000.00, 1800.00, 'Available', NULL, '2025-07-01', 'Belete Esubalew', '+251944567890', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
('LND-ICTA-205', 4, 'Commercial', 'North Section', 1800.00, 1200.00, 'Available', NULL, '2025-08-15', 'Belete Esubalew', '+251922345678', '2025-12-21 14:56:49', '2025-12-21 14:56:49');

-- --------------------------------------------------------

--
-- Table structure for table `live_events`
--

CREATE TABLE `live_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `location` varchar(255) DEFAULT NULL,
  `stream_platform` varchar(50) DEFAULT 'youtube',
  `stream_url` varchar(255) DEFAULT NULL,
  `stream_poster` varchar(255) DEFAULT NULL,
  `stream_aspect` varchar(20) DEFAULT '16:9',
  `chat_enabled` tinyint(1) DEFAULT 1,
  `chat_pinned` varchar(255) DEFAULT NULL,
  `estimated_viewers` int(11) DEFAULT 0,
  `status` enum('draft','published','live','ended') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_streaming` tinyint(1) DEFAULT 0,
  `is_recording` tinyint(1) DEFAULT 0,
  `recording_url` varchar(255) DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `signaling_data` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=3;

--
-- Dumping data for table `live_events`
--

INSERT INTO `live_events` (`id`, `title`, `subtitle`, `description`, `event_date`, `start_time`, `end_time`, `timezone`, `location`, `stream_platform`, `stream_url`, `stream_poster`, `stream_aspect`, `chat_enabled`, `chat_pinned`, `estimated_viewers`, `status`, `created_at`, `updated_at`, `is_streaming`, `is_recording`, `recording_url`, `actual_start_time`, `signaling_data`) VALUES
(1, 'ITPC Hub Innovation Summit 2025', 'Exploring the future of Ethiopia\'s Digital Economy', NULL, '2025-12-15', '09:30:00', '17:00:00', 'UTC', 'Main Exhibition Hall, Addis Ababa', 'youtube', '', 'https://images.unsplash.com/photo-1540575861501-7ad060e1c415?auto=format&fit=crop&q=80', '16:9', 1, NULL, 0, 'ended', '2025-12-21 15:19:17', '2025-12-25 14:12:00', 0, 0, NULL, '2025-12-25 14:09:16', '{\"type\":\"offer\",\"sdp\":{\"type\":\"offer\",\"sdp\":\"v=0\\r\\no=- 5913015373708301636 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0 1\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS 25aa56ae-2589-4b4a-8aa2-c28946891578\\r\\nm=audio 19565 UDP/TLS/RTP/SAVPF 111 63 9 0 8 13 110 126\\r\\nc=IN IP4 196.189.144.6\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=candidate:878227986 1 udp 2122260223 192.168.65.1 59391 typ host generation 0 network-id 1\\r\\na=candidate:2570080246 1 udp 2122194687 192.168.19.1 59392 typ host generation 0 network-id 2\\r\\na=candidate:1973121577 1 udp 2122129151 192.168.56.1 59393 typ host generation 0 network-id 4\\r\\na=candidate:1904945384 1 udp 2122063615 10.223.126.103 59394 typ host generation 0 network-id 3 network-cost 10\\r\\na=candidate:3404883590 1 tcp 1518280447 192.168.65.1 9 typ host tcptype active generation 0 network-id 1\\r\\na=candidate:1738185570 1 tcp 1518214911 192.168.19.1 9 typ host tcptype active generation 0 network-id 2\\r\\na=candidate:2335286973 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 4\\r\\na=candidate:2401369212 1 tcp 1518083839 10.223.126.103 9 typ host tcptype active generation 0 network-id 3 network-cost 10\\r\\na=candidate:3879947825 1 udp 1685855999 196.189.144.6 19565 typ srflx raddr 10.223.126.103 rport 59394 generation 0 network-id 3 network-cost 10\\r\\na=ice-ufrag:5Kio\\r\\na=ice-pwd:YZmIZl22KDOtVH/yYJh2SGQs\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 BC:09:8C:C9:09:99:27:7B:8B:D7:C1:D9:D2:8F:97:58:29:79:69:8E:07:08:DC:B7:79:83:B9:3E:9B:A0:A3:C9\\r\\na=setup:actpass\\r\\na=mid:0\\r\\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\\r\\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\\r\\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\\r\\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=sendrecv\\r\\na=msid:25aa56ae-2589-4b4a-8aa2-c28946891578 3525c91f-3b3d-4efe-b96f-41d7470c8dd1\\r\\na=rtcp-mux\\r\\na=rtcp-rsize\\r\\na=rtpmap:111 opus/48000/2\\r\\na=rtcp-fb:111 transport-cc\\r\\na=fmtp:111 minptime=10;useinbandfec=1\\r\\na=rtpmap:63 red/48000/2\\r\\na=fmtp:63 111/111\\r\\na=rtpmap:9 G722/8000\\r\\na=rtpmap:0 PCMU/8000\\r\\na=rtpmap:8 PCMA/8000\\r\\na=rtpmap:13 CN/8000\\r\\na=rtpmap:110 telephone-event/48000\\r\\na=rtpmap:126 telephone-event/8000\\r\\na=ssrc:870331714 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:870331714 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 3525c91f-3b3d-4efe-b96f-41d7470c8dd1\\r\\nm=video 46855 UDP/TLS/RTP/SAVPF 96 97 103 104 107 108 109 114 115 116 117 118 39 40 45 46 98 99 100 101 119 120 49 50 123 124 125\\r\\nc=IN IP4 196.189.144.6\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=candidate:878227986 1 udp 2122260223 192.168.65.1 59395 typ host generation 0 network-id 1\\r\\na=candidate:2570080246 1 udp 2122194687 192.168.19.1 59396 typ host generation 0 network-id 2\\r\\na=candidate:1973121577 1 udp 2122129151 192.168.56.1 59397 typ host generation 0 network-id 4\\r\\na=candidate:1904945384 1 udp 2122063615 10.223.126.103 59398 typ host generation 0 network-id 3 network-cost 10\\r\\na=candidate:3404883590 1 tcp 1518280447 192.168.65.1 9 typ host tcptype active generation 0 network-id 1\\r\\na=candidate:1738185570 1 tcp 1518214911 192.168.19.1 9 typ host tcptype active generation 0 network-id 2\\r\\na=candidate:2335286973 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 4\\r\\na=candidate:2401369212 1 tcp 1518083839 10.223.126.103 9 typ host tcptype active generation 0 network-id 3 network-cost 10\\r\\na=candidate:3879947825 1 udp 1685855999 196.189.144.6 46855 typ srflx raddr 10.223.126.103 rport 59398 generation 0 network-id 3 network-cost 10\\r\\na=ice-ufrag:5Kio\\r\\na=ice-pwd:YZmIZl22KDOtVH/yYJh2SGQs\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 BC:09:8C:C9:09:99:27:7B:8B:D7:C1:D9:D2:8F:97:58:29:79:69:8E:07:08:DC:B7:79:83:B9:3E:9B:A0:A3:C9\\r\\na=setup:actpass\\r\\na=mid:1\\r\\na=extmap:14 urn:ietf:params:rtp-hdrext:toffset\\r\\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\\r\\na=extmap:13 urn:3gpp:video-orientation\\r\\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\\r\\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\\r\\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\\r\\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\\r\\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\\r\\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\\r\\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\\r\\na=sendrecv\\r\\na=msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\na=rtcp-mux\\r\\na=rtcp-rsize\\r\\na=rtpmap:96 VP8/90000\\r\\na=rtcp-fb:96 goog-remb\\r\\na=rtcp-fb:96 transport-cc\\r\\na=rtcp-fb:96 ccm fir\\r\\na=rtcp-fb:96 nack\\r\\na=rtcp-fb:96 nack pli\\r\\na=rtpmap:97 rtx/90000\\r\\na=fmtp:97 apt=96\\r\\na=rtpmap:103 H264/90000\\r\\na=rtcp-fb:103 goog-remb\\r\\na=rtcp-fb:103 transport-cc\\r\\na=rtcp-fb:103 ccm fir\\r\\na=rtcp-fb:103 nack\\r\\na=rtcp-fb:103 nack pli\\r\\na=fmtp:103 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\\r\\na=rtpmap:104 rtx/90000\\r\\na=fmtp:104 apt=103\\r\\na=rtpmap:107 H264/90000\\r\\na=rtcp-fb:107 goog-remb\\r\\na=rtcp-fb:107 transport-cc\\r\\na=rtcp-fb:107 ccm fir\\r\\na=rtcp-fb:107 nack\\r\\na=rtcp-fb:107 nack pli\\r\\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f\\r\\na=rtpmap:108 rtx/90000\\r\\na=fmtp:108 apt=107\\r\\na=rtpmap:109 H264/90000\\r\\na=rtcp-fb:109 goog-remb\\r\\na=rtcp-fb:109 transport-cc\\r\\na=rtcp-fb:109 ccm fir\\r\\na=rtcp-fb:109 nack\\r\\na=rtcp-fb:109 nack pli\\r\\na=fmtp:109 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\\r\\na=rtpmap:114 rtx/90000\\r\\na=fmtp:114 apt=109\\r\\na=rtpmap:115 H264/90000\\r\\na=rtcp-fb:115 goog-remb\\r\\na=rtcp-fb:115 transport-cc\\r\\na=rtcp-fb:115 ccm fir\\r\\na=rtcp-fb:115 nack\\r\\na=rtcp-fb:115 nack pli\\r\\na=fmtp:115 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f\\r\\na=rtpmap:116 rtx/90000\\r\\na=fmtp:116 apt=115\\r\\na=rtpmap:117 H264/90000\\r\\na=rtcp-fb:117 goog-remb\\r\\na=rtcp-fb:117 transport-cc\\r\\na=rtcp-fb:117 ccm fir\\r\\na=rtcp-fb:117 nack\\r\\na=rtcp-fb:117 nack pli\\r\\na=fmtp:117 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\\r\\na=rtpmap:118 rtx/90000\\r\\na=fmtp:118 apt=117\\r\\na=rtpmap:39 H264/90000\\r\\na=rtcp-fb:39 goog-remb\\r\\na=rtcp-fb:39 transport-cc\\r\\na=rtcp-fb:39 ccm fir\\r\\na=rtcp-fb:39 nack\\r\\na=rtcp-fb:39 nack pli\\r\\na=fmtp:39 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=4d001f\\r\\na=rtpmap:40 rtx/90000\\r\\na=fmtp:40 apt=39\\r\\na=rtpmap:45 AV1/90000\\r\\na=rtcp-fb:45 goog-remb\\r\\na=rtcp-fb:45 transport-cc\\r\\na=rtcp-fb:45 ccm fir\\r\\na=rtcp-fb:45 nack\\r\\na=rtcp-fb:45 nack pli\\r\\na=fmtp:45 level-idx=5;profile=0;tier=0\\r\\na=rtpmap:46 rtx/90000\\r\\na=fmtp:46 apt=45\\r\\na=rtpmap:98 VP9/90000\\r\\na=rtcp-fb:98 goog-remb\\r\\na=rtcp-fb:98 transport-cc\\r\\na=rtcp-fb:98 ccm fir\\r\\na=rtcp-fb:98 nack\\r\\na=rtcp-fb:98 nack pli\\r\\na=fmtp:98 profile-id=0\\r\\na=rtpmap:99 rtx/90000\\r\\na=fmtp:99 apt=98\\r\\na=rtpmap:100 VP9/90000\\r\\na=rtcp-fb:100 goog-remb\\r\\na=rtcp-fb:100 transport-cc\\r\\na=rtcp-fb:100 ccm fir\\r\\na=rtcp-fb:100 nack\\r\\na=rtcp-fb:100 nack pli\\r\\na=fmtp:100 profile-id=2\\r\\na=rtpmap:101 rtx/90000\\r\\na=fmtp:101 apt=100\\r\\na=rtpmap:119 H264/90000\\r\\na=rtcp-fb:119 goog-remb\\r\\na=rtcp-fb:119 transport-cc\\r\\na=rtcp-fb:119 ccm fir\\r\\na=rtcp-fb:119 nack\\r\\na=rtcp-fb:119 nack pli\\r\\na=fmtp:119 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\\r\\na=rtpmap:120 rtx/90000\\r\\na=fmtp:120 apt=119\\r\\na=rtpmap:49 H265/90000\\r\\na=rtcp-fb:49 goog-remb\\r\\na=rtcp-fb:49 transport-cc\\r\\na=rtcp-fb:49 ccm fir\\r\\na=rtcp-fb:49 nack\\r\\na=rtcp-fb:49 nack pli\\r\\na=fmtp:49 level-id=93;profile-id=1;tier-flag=0;tx-mode=SRST\\r\\na=rtpmap:50 rtx/90000\\r\\na=fmtp:50 apt=49\\r\\na=rtpmap:123 red/90000\\r\\na=rtpmap:124 rtx/90000\\r\\na=fmtp:124 apt=123\\r\\na=rtpmap:125 ulpfec/90000\\r\\na=ssrc-group:FID 1811404858 3192608943\\r\\na=ssrc:1811404858 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:1811404858 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\na=ssrc:3192608943 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:3192608943 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\n\"},\"from\":\"admin\"}');

-- --------------------------------------------------------

--
-- Table structure for table `live_event_agenda`
--

CREATE TABLE `live_event_agenda` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `time` time NOT NULL,
  `title` varchar(255) NOT NULL,
  `speaker` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=4;

--
-- Dumping data for table `live_event_agenda`
--

INSERT INTO `live_event_agenda` (`id`, `event_id`, `time`, `title`, `speaker`) VALUES
(1, 1, '09:30:00', 'Opening Ceremony', 'Minister of Innovation'),
(2, 1, '10:30:00', 'Panel: Future of Startups', 'Dr. Abate Solomon'),
(3, 1, '14:00:00', 'ICT Infrastructure Roadmap', 'Eng. Teklehaimanot');

-- --------------------------------------------------------

--
-- Table structure for table `live_event_speakers`
--

CREATE TABLE `live_event_speakers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=3;

--
-- Dumping data for table `live_event_speakers`
--

INSERT INTO `live_event_speakers` (`id`, `event_id`, `name`, `role`, `photo`) VALUES
(1, 1, 'Olana Abebe', 'Deputy CEO', ''),
(2, 1, 'Belete Esubalew', 'CEO', '');

-- --------------------------------------------------------

--
-- Table structure for table `media_gallery`
--

CREATE TABLE `media_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `type` enum('image','video') NOT NULL,
  `description` text DEFAULT NULL,
  `src` varchar(1024) NOT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `youtube_url_original` varchar(1024) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=6;

--
-- Dumping data for table `media_gallery`
--

INSERT INTO `media_gallery` (`id`, `title`, `date`, `category`, `type`, `description`, `src`, `poster`, `youtube_url_original`, `created_at`, `updated_at`) VALUES
(5, 'Digital Ethiopia Logo', '2025-12-21', 'Technology', 'image', '<p>ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው</p>', '/uploads/1766418769835-photo_2025-12-22_22-43-39 (2).jpg', '/uploads/1766418769837-photo_2025-12-22_22-43-39 (2).jpg', NULL, '2025-12-22 15:43:18', '2025-12-22 15:52:49');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `image` varchar(2048) NOT NULL,
  `description` text NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `readTime` varchar(50) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `comments` int(11) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `youtubeUrl` varchar(255) DEFAULT NULL,
  `imageAltText` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=16;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `date`, `category`, `image`, `description`, `featured`, `readTime`, `tags`, `comments`, `createdAt`, `updatedAt`, `youtubeUrl`, `imageAltText`) VALUES
(9, 'አዲስ አመራሮች ከኢንፎርሜሽን ቴክኖሎጂ ፓርክ አልሚ ድርጅቶች  ጋር ተወያዩ', '2025-12-16', 'Government Initiatives', '[\"/uploads/1766410294126-photo_2025-12-22_22-30-37.jpg\",\"/uploads/1766410294128-photo_2025-12-22_22-30-39.jpg\",\"/uploads/1766410294130-photo_2025-12-22_22-30-42.jpg\",\"/uploads/1766410294132-photo_2025-12-22_22-30-43.jpg\",\"/uploads/1766410294135-photo_2025-12-22_22-30-52.jpg\"]', '<p>አዲስ አመራሮች ከኢንፎርሜሽን ቴክኖሎጂ ፓርክ አልሚ ድርጅቶች ጋር ተወያዩ...</p><p>የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን አዲስ አመራሮች፣ ከፓርኩ ነዋሪዎች ጋር የመጀመሪያ የሆነ የትውውቅና የውይይት መድረክ አካሂደዋል። ይህ በዋና ስራ አስፈጻሚው አቶ በለጠ እሱባለው እና በምክትላቸው አቶ ኦላና አበበ የተመራው መድረክ፣ አመራሮቹ አልሚ ድርጅቶች በይፋ ለመተዋወቅና የነዋሪዎችን ሀሳብ ለመስማት ያለመ ነበር።</p><p>በውይይቱ ላይ ተሳታፊ የነበሩት አልሚ ድርጅቶች የፓርኩን ጠንካራ ጎኖች በመጠቆም እንዲሁም መስተካከል አለባቸው ያሏቸውን ጉዳዮች በማንሳት ለአዲሶቹ አመራሮች ግብዓት ሰጥተዋል። አልሚ ድርጅቶቹ ያነሷቸውን ሀሳቦችና አስተያየቶች ተከትሎ፣ አመራሮቹ ማብራሪያ ሰጥተዋል፡፡ አከለዉም \"ይህ የትውውቅ መድረክ የመጀመሪያችን ነው\" በማለት አንዳንድ ጉዳዮችን በጠባብ መድረኮች ሰፋ ያለ ውይይት በማድረግ የሚፈቱ ጉዳዮች እንደሚኖሩም ገልጸዋል።</p><p>በመጨረሻም በተነሱት ችግሮች ላይ ተጨባጭ መፍትሄ ለማምጣት ከአልሚ ድርጅቶች ጋር በጋራ እንደሚሰሩ ያረጋገጡ ሲሆን፣ ሁሉም የፓርኩ አልሚ ድርጅቶች ለስነ-ምህዳሩ እድገት የበኩሉን አስተዋፅኦ እንዲያበረክት ጥሪ አቅርበዋል።</p>', 0, '10', '[\"#ITPC #PMOEthiopia  #striving_for_eco_industrial_park #industrialpark\"]', 0, '2025-05-10 20:57:34', '2025-12-22 13:37:00', NULL, NULL),
(13, 'ዲጂታል ኢትዮጵያ 2025 ሙሉ ለሙሉ በሚባል ደረጃ የታለመለትን ግብ አሳክቶ ተጠናቋል', '2025-12-20', 'Strategic Partnerships', '[\"/uploads/1766409846968-photo_2025-12-22_22-21-00.jpg\",\"/uploads/1766409846970-photo_2025-12-22_22-21-02.jpg\",\"/uploads/1766409846973-photo_2025-12-22_22-21-59.jpg\",\"/uploads/1766409846984-photo_2025-12-22_22-22-22.jpg\"]', '<p>ዲጂታል ኢትዮጵያ<strong><em><u> 2025 ሙሉ ለሙሉ</u></em></strong> በሚባል ደረጃ የታለመለትን ግብ አሳክቶ ተጠናቋል። በዛሬው እለትም ዲጂታል ኢትዮጵያ 2030 በይፋ አስጀምረናል። ተደራሽነትን ማስፋት፣ ለዜጎች እኩል እድል መፍጠር እንዲሁም በዜጎችና ተቋማት መካከል መተማመንን ማጎልበት ደግሞ የስትራቴጂው ቁልፍ መሰረታዊ ትልሞች ናቸው።</p>', 0, '4', '[\"#ITPC#PMOEthiopia  #striving_for_eco_industrial_park\"]', 0, '2025-12-18 16:33:26', '2025-12-23 08:38:38', 'https://www.youtube.com/watch?v=buC1-gn6rPw', NULL),
(14, 'በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በዲጅታል አማራጭ ለገበያ ለማቅረብ የሚያስችል ስምምነት ተፈረመ', '2025-12-15', 'Strategic Partnerships', '[\"/uploads/1766409349232-photo_2025-12-22_22-14-09.jpg\",\"/uploads/1766409349243-photo_2025-12-22_22-14-14.jpg\",\"/uploads/1766409349249-photo_2025-12-22_22-14-16.jpg\",\"/uploads/1766409349250-photo_2025-12-22_22-14-18.jpg\"]', '<p>በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በዲጅታል አማራጭ ለገበያ ለማቅረብ የሚያስችል ስምምነት ተፈረመ</p><p>የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን እና ኢትዮ ቴሌኮም በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በ\'ዘመን ገበያ\' ለሀገር ውስጥ ገበያተኞች ለማቅረብ የሚያስችል ስምምነት ተፈራርመዋል::</p><p>የስምምነት ፊርማውን የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈፃሚ ፍሰሃ ይታገሱ (ዶ/ር) እና የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚ ፍሬህይወት ታምሩ ተፈራርመዋል::</p><p>በፊርማ ስነ-ስርዓቱ የመክፈቻ ንግግር ያደረጉት የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈፃሚ ፍሰሃ ይታገሱ (ዶ/ር) በመላው ሃገሪቱ በሚገኙ ልዩ የኢኮኖሚ ዞኖችና ኢንዱስትሪ ፓርኮች ውስጥ የሚገኙ አምራቾች ምርቶቻቸውን ወደ ዘመን ገበያ በማስገባት፤ በዓለም አቀፍ ገበያ ተወዳጅና ትልቅ ስም ያላቸው ምርቶችን፣ ለሀገር ውስጥ ሸማቾች ለማቅረብ ከማስቻሉ በተጨማሪ ዲጅታል ኢትዮጵያን እውን ለማድረግ በሃገራችን አንጋፋ ከሆነው ሃገራዊ ተቋም ኢትዮ ቴሌኮም ጋር በመፈራረማችን ደስታ ይሰማናል ብለዋል፡፡</p><p>ዶ/ር ፍስሃ በተጨማሪም ስምምነቱ በዲጂታል ግብይት ዘርፍ የዲጂታል 2030 ስትራቴጂን ውጤታማ ለማድረግ የሚያግዝና በጅምር ላይ የሚገኘውን የሃገራችን የኤሌክትሮኒክ የግብይት ስርዓት በመደበኛነት ለማስቀጠል ትልቅ ዕድል መፍጠር ያስችላል ብለዋል።</p><p>የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚ ፍሬህይወት ታምሩ በበኩላቸው የሀገራችን የግብይት ሥርዓት በዲጂታል በማዘመን ወደ ላቀ ምዕራፍ ለማሸጋገር የሚያስችል፣ ሁሉን አቀፍ እና አካታች የሆነውን \'ዘመን ገበያ\' የተሰኘ ዘመናዊ የዲጂታል ግብይት ፕላትፎርም ማስጀመሩን ገልጸው በልዩ የኢኮኖሚ ዞኖች የሚገኙ አምራቾችም ፕላትፎርሙን ተጠቅመው ምርቶቻቸውን በሰፊው የማስተዋወቅና አስተማማኝ የገበያ ትስስር በመፍጠር አጠቃላይ የሀገራችንን የንግድ ሥነ ምህዳር ወደ ዘመናዊና ተወዳዳሪ ደረጃ ለማሸጋገር ያለመ ነው ብለዋል::</p><p>ስምምነቱ በልዩ የኢኮኖሚ ዞኖች የሚገኙ አምራቾች የኤክስፖርት ደረጃቸውን የጠበቁ ምርቶቻቸውን በስፋትና በተቀላጠፈ ሁኔታ ተደራሽ እንዲያደርጉ ያግዛል ተብሏል::</p><p>የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን በመላው ሃገሪቱ ገንብቶ በሚያስተዳድራቸው 11 ልዩ የኢኮኖሚ ዞኖችና 3 ኢንዱስትሪ ፓርኮች ውስጥ ከ 200 በላይ ትልልቅ ስምና ዝና ያላቸው አምራቾች ያሉ ሲሆን ኢትዮ ቴሌኮም ከአፍሪካ ግንባር ቀደም የተቀናጀና የቴሌኮም እና የዲጂታል መፍትሄዎች አቅራቢ ኩባንያ ነው::</p>', 0, '5 min read', '[\"hashtag#techtalent hashtag#ethiopianitpark\"]', 0, '2025-12-19 08:19:02', '2025-12-22 13:37:48', 'https://www.youtube.com/watch?v=gUV0bRZzAoU&list=RDdc5983-LrFk&index=4', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `offices`
--

CREATE TABLE `offices` (
  `id` varchar(50) NOT NULL,
  `zone` varchar(100) NOT NULL,
  `building_id` int(11) NOT NULL,
  `unit_number` varchar(50) NOT NULL,
  `floor` int(11) NOT NULL,
  `size_sqm` decimal(10,2) NOT NULL,
  `status` enum('Available','Rented') DEFAULT 'Available',
  `price_monthly` decimal(15,2) NOT NULL,
  `rented_by` varchar(255) DEFAULT NULL,
  `available_from` date DEFAULT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offices`
--

INSERT INTO `offices` (`id`, `zone`, `building_id`, `unit_number`, `floor`, `size_sqm`, `status`, `price_monthly`, `rented_by`, `available_from`, `contact_name`, `contact_phone`, `created_at`, `updated_at`) VALUES
('OFF-ICTA-305', 'Tech Innovation Zone', 1, 'A305', 3, 85.00, 'Available', 18750.00, NULL, '2025-06-01', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('OFF-ICTA-402', 'Tech Innovation Zone', 1, 'A402', 4, 95.00, 'Available', 20000.00, NULL, '2025-07-01', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('OFF-ICTB-201', 'Business Hub Zone', 2, 'B201', 2, 120.00, 'Rented', 25000.00, 'TechEthiopia Solutions', '2026-01-15', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('OFF-ICTB-620', 'Enterprise Zone', 2, 'B620', 6, 200.00, 'Available', 42000.00, NULL, '2025-09-01', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('OFF-ICTC-510', 'Digital Services Zone', 3, 'C510', 5, 150.00, 'Available', 32000.00, NULL, '2025-08-15', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('OFF-ICTD-105', 'Startup Incubator Zone', 4, 'D105', 1, 70.00, 'Rented', 15000.00, 'Ethio Digital Solutions', '2026-03-01', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
('test', 'BPO', 5, '121', 2, 100.00, 'Available', 121.00, NULL, NULL, 'hayal Tamrat', '091122121', '2025-12-21 14:51:07', '2025-12-21 14:51:07');

-- --------------------------------------------------------

--
-- Table structure for table `office_buildings`
--

CREATE TABLE `office_buildings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_offices` int(11) DEFAULT 0,
  `available_offices` int(11) DEFAULT 0,
  `total_size_sqm` decimal(10,2) DEFAULT 0.00,
  `icon_name` varchar(100) DEFAULT 'FaBuilding',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=6;

--
-- Dumping data for table `office_buildings`
--

INSERT INTO `office_buildings` (`id`, `name`, `description`, `total_offices`, `available_offices`, `total_size_sqm`, `icon_name`, `created_at`, `updated_at`) VALUES
(1, 'Encubation', 'Premium office spaces designed for tech companies and startups with modern amenities and high-speed internet.', 50, 30, 4500.00, 'FaBuilding', '2025-12-21 14:34:14', '2025-12-21 14:48:59'),
(2, 'ICT Tower B', 'Enterprise-grade office spaces with larger floor plans, suitable for established companies and organizations.', 40, 15, 5200.00, 'FaBuilding', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
(3, 'ICT Tower C', 'Mixed-use office spaces with flexible layouts, ideal for digital service providers and creative agencies.', 45, 25, 4800.00, 'FaBuilding', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
(4, 'ICT Tower D', 'Affordable office spaces designed for startups and small businesses with essential amenities.', 60, 35, 3800.00, 'FaBuilding', '2025-12-21 14:34:14', '2025-12-21 14:34:14'),
(5, 'BPO', 'BPO Zone', 7, 6, 2332.00, 'FaBuilding', '2025-12-21 14:43:48', '2025-12-21 14:43:48');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `partnership_type` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `industry_type` varchar(100) DEFAULT NULL,
  `agreement_start_date` datetime DEFAULT NULL,
  `agreement_end_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive','Ongoing') DEFAULT 'Active',
  `services_provided` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `partner_id` (`partner_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=2;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `partner_id`, `company_name`, `contact_name`, `contact_email`, `partnership_type`, `country`, `zone`, `industry_type`, `agreement_start_date`, `agreement_end_date`, `status`, `services_provided`, `logo`, `description`, `meta_title`, `meta_description`, `meta_keywords`, `slug`, `website`, `linkedin`, `twitter`, `facebook`, `created_at`, `updated_at`, `gallery`) VALUES
(1, '1', 'MINT(Mister of Inovation and Technology)', 'Bereket Tamrat', 'berekettamrat2015@gmail.com', 'Government', 'Ethiopia', 'IT Park, Addis Ababa', 'Technology ', NULL, NULL, 'Active', '[\"Gov\'t\"]', '/uploads/partners-investors/logo-1766428975531-195184812.jpg', 'Ministry of Innovation and Technology (MInT) former Ministry of Science and Technology is a governmental institution that established for the first time in December 1975 by proclamation No.62/1975 as a commission. Following the change in government in 1991 and with the issuance of the new economic policy, the Commission was re-established in March 1994 by Proclamation No.91/94. The commission went into its 3rd phase of re-institution on the 24th of August 1995 by Proclamation No.7/1995, following the establishment of Federal Democratic Republic of Ethiopia as an Agency.\r\nLater on, in 2008 the government upgraded the Agency as one of the Cabinet ministries accountable to the prime minister and the council of ministers by the proclamation No. 604/2008 and re established recently too in October 2010 according to definition of powers and duties of the executive organs of the Federal Democratic Republic of Ethiopia proclamation No. 691/2010.', 'Ministry of Innovation and Technology', 'Ministry of Innovation and Technology (MInT) former Ministry of Science and Technology is a governmental institution that established for the first time in December 1975 by proclamation No.62/1975 as a commission. Following the change in government in 1991 and with the issuance of the new economic policy, the Commission was re-established in March 1994 by Proclamation No.91/94. The commission went into its 3rd phase of re-institution on the 24th of August 1995 by Proclamation No.7/1995, following the establishment of Federal Democratic Republic of Ethiopia as an Agency.\r\nLater on, in 2008 the government upgraded the Agency as one of the Cabinet ministries accountable to the prime minister and the council of ministers by the proclamation No. 604/2008 and re established recently too in October 2010 according to definition of powers and duties of the executive organs of the Federal Democratic Republic of Ethiopia proclamation No. 691/2010.', 'Ministry of Innovation and Technology, Ministry of Innovation, mint.gov.et', 'mint.gov.et, MINT, Ministry of Innovation and Technology,Ministry of Science and Technology', 'https://www.mint.gov.et/', 'https://et.linkedin.com/company/ministry-of-innovation-and-technology-ethiopia', 'https://x.com/MinistryofInno2', 'https://web.facebook.com/MInT.Ethiopia', '2025-12-22 18:34:35', '2025-12-23 06:47:05', '[\"/uploads/partners-investors/gallery-1766472425176-103052208.jpg\",\"/uploads/partners-investors/gallery-1766472425231-295078810.jpg\",\"/uploads/partners-investors/gallery-1766472425232-73020013.jpg\",\"/uploads/partners-investors/gallery-1766472425233-32263675.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=28;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `status`) VALUES
(1, 'Admin', 1),
(2, 'transport_birro', 1),
(3, 'system_owner', 1),
(4, 'casher', 0),
(5, 'registar', 0),
(6, 'agent', 0),
(7, '', 0),
(8, '..', 0);

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `status` enum('active','unsubscribed') DEFAULT 'active',
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=5;

--
-- Dumping data for table `subscribers`
--

INSERT INTO `subscribers` (`id`, `email`, `status`, `subscribed_at`, `unsubscribed_at`) VALUES
(1, 'hayaltamrat@gmail.com', 'active', '2025-12-19 08:07:31', NULL),
(4, 'hayaltamrat1@gmail.com', 'active', '2025-12-19 08:13:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `training_workshops`
--

CREATE TABLE `training_workshops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `instructor` varchar(100) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `link` varchar(255) DEFAULT NULL,
  `status` enum('Upcoming','Ongoing','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=4;

--
-- Dumping data for table `training_workshops`
--

INSERT INTO `training_workshops` (`id`, `title`, `image_url`, `event_date`, `duration`, `location`, `type`, `instructor`, `capacity`, `summary`, `description`, `tags`, `link`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Full Stack Web Development Bootcamp', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80', '2024-07-15', '6 Weeks', 'IT Park, Addis Ababa', 'Bootcamp', 'Abebe Kebede', 40, 'Intensive hands-on bootcamp covering React, Node.js, and cloud deployment.', 'Detailed curriculum covering HTML, CSS, JavaScript, React, Node.js, Express, and MySQL. Project-based learning with a final real-world deployment.', '[\"Web\",\"Full Stack\",\"Bootcamp\"]', '/training/webdev-bootcamp', 'Upcoming', '2025-12-23 08:36:13', '2025-12-23 08:36:13'),
(2, 'AI & Machine Learning Workshop', '/uploads/trainings/1766479056568.jpg', '2024-08-09', '2 Days', 'IT Park, Addis Ababa', 'Workshop', 'Sara Alemu', 30, 'Explore practical AI/ML concepts and build your first intelligent app.', 'Hands-on workshop focusing on Python for ML, scikit-learn basics, and building simple predictive models.', '[\"AI\",\"Machine Learning\",\"Workshop\"]', '', 'Upcoming', '2025-12-23 08:36:13', '2025-12-23 08:37:36'),
(3, 'Entrepreneurship for Startups', '/uploads/trainings/1766479082401.jpg', '2024-08-31', '1 Week', 'Virtual', 'Seminar', 'John Tesfaye', 100, 'Learn how to launch, fund, and scale your startup from industry leaders.', 'Comprehensive seminar covering business planning, MVP development, funding rounds, and scaling strategies for tech startups.', '[\"Entrepreneurship\",\"Startup\",\"Seminar\"]', '', 'Upcoming', '2025-12-23 08:36:13', '2025-12-23 08:38:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` enum('1','0') DEFAULT '1',
  `online_flag` tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`user_name`),
  KEY `employee_id` (`employee_id`),
  KEY `fk_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=35;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `user_name`, `password`, `created_at`, `status`, `online_flag`, `updated_at`, `role_id`, `avatar_url`) VALUES
(1, 21, 'www', '$2b$10$wr58QSzvz/HWVMz5U8ttv.RQTQOkHMEf2S/SkYOt2eD9sTsAeQtuy', '2024-11-06 11:46:34', '1', 0, '2024-11-11 04:13:18', NULL, NULL),
(2, 43, 'eeee44e@gmail.com', '$2b$10$AV7kZtfFlQwS7c34ryaCx.vgwWb7jy0pPqhDpT2Sxa/Vd5YakkEuK', '2024-11-10 23:08:20', '1', 0, '2024-11-25 00:38:43', NULL, NULL),
(3, 45, 'onerrr@gmail.com', '$2b$10$IFpKwiESxD3No7PwC.ShsuiJuy9.tcPRMJtEMTfQYi6Uy/NUajxZu', '2024-11-10 23:18:44', '1', 1, '2025-12-18 22:36:57', 1, NULL),
(4, 46, 'woya@gmail.com', '$2b$10$OD8jd/hPB7ZcH9GJy9Pr/.ovNiO1QVNCgFbrcrXULwcH7kp.qdq.S', '2024-11-10 23:59:47', '1', 0, '2024-11-11 05:47:43', 8, NULL),
(5, 48, 'hl@gmail.com', '$2b$10$Q1KieAzu4fFS0dwh6Vxty.GOgUu8xL2SyAaS1Vis9DkeMQxSt30Pq', '2024-11-11 22:30:13', '1', 0, '2024-11-11 22:30:13', 8, NULL),
(6, 49, 'yonas@itp.org', '$2b$10$ktd.Y1lVFq4EOyoKkDZnhu6yJ1JNWBykmrpmFUKMBsSo4b4/IP/7K', '2024-11-11 23:41:28', '1', 0, '2024-11-20 04:42:44', 2, NULL),
(7, 50, 'simegn@itp.org', '$2b$10$6SbuHMtP7XMbwVdakqMr1eTCY9QIhHxabIBHgI.CZpN9wqROs8rr6', '2024-11-11 23:44:17', '1', 1, '2025-04-17 11:19:49', NULL, '/uploads/1744466201370-photo_2024-12-21_09-16-01.jpg'),
(8, 51, 'hayal@itp.org', '$2b$10$8QrTeqaPBAnLZXdCHqzkMuoxgUc63IWsXMR6Qfn8FtaQ9kjaJCyWm', '2024-11-11 23:45:43', '1', 1, '2025-05-10 17:36:12', 8, NULL),
(9, 54, 'hayalt@itp.org', '$2b$10$fiYp77BQuhOk9eZDl77hROkL7aEYeyLZPojgbfij/YpVo0B6IVENi', '2024-11-11 23:46:31', '1', 0, '2024-11-12 03:28:01', 8, NULL),
(10, 55, 'abe@itp.et', '$2b$10$6Ptxn.bGG6WonQvgi08ZVeWOKhIf414AU.Rf8biKg5DM5w6.t6R2W', '2024-11-12 03:52:54', '1', 1, '2024-11-13 00:03:58', 4, NULL),
(11, 56, 'beki33333333333@gmail.com', '$2b$10$IWJvw/rD3F5c75O71ue3JepPiTXnxsZeiUYygfRFDYGfZqeMF.IPK', '2024-11-12 03:56:31', '1', 0, '2024-11-12 03:56:31', 4, NULL),
(12, 57, 'staf@gmail.com', '$2b$10$Wvcpmhed2gaCmaVQH3dEZeykZqhum/Szobc3rRweHGIhpzKO.Rxha', '2024-11-12 03:59:33', '1', 0, '2024-11-14 04:26:14', 8, NULL),
(13, 58, 'nebyat@itp.et', '$2b$10$5X.XMQQMRay/6zJDdEReI.MLzAcq.ed9xBk5OO4UELVvaG2fckm5K', '2024-11-14 01:06:52', '1', 0, '2025-04-12 05:53:03', 6, NULL),
(14, 59, 'ewunetu@itp.et', '$2b$10$KPHuhuIPciZ.cVg0BBCK7egMKZQqsXsNGzX/Xq4C0nBzUEEsTj62u', '2024-11-14 01:08:04', '1', 1, '2024-12-30 12:02:02', 7, NULL),
(15, 60, 'manager@itp.et', '$2b$10$YC.zK8u88DfkTI.fTL7I2eZkFV0jTSPb7I3IVl99z0htdWzu9/qdW', '2024-11-14 01:34:28', '1', 0, '2024-11-19 22:29:05', 3, NULL),
(16, 62, 'staf1@itp.et', '$2b$10$lQ6KmKDb38sqinMsHODD8Ocj3vR/s5y1R5EfHVaT8lCPAqULU.9i6', '2024-11-14 05:27:48', '1', 0, '2025-04-04 07:49:05', 8, NULL),
(17, 63, 'berrrrrki@gmail.com', '$2b$10$44MGUjABmQFL6C39kRH.wevHAvA0URLNg0NiGjhSVMQEZLJ92VFTa', '2024-11-22 03:02:23', '1', 0, '2024-11-22 03:02:23', 6, NULL),
(18, 64, 'eeee@gmail.com', '$2b$10$At9MAsh2IMjheS6B5znOmOeVCR9glbD8gKFUsKmF/mIKEqHv5P3FO', '2024-11-24 23:59:11', '1', 0, '2024-11-24 23:59:11', 1, NULL),
(19, 65, 'teaml@gmail.com', '$2b$10$JoeJGvKXSfm.k0e43w0f2ujj1WWrzCZs40TF9NeqAKpWFZSQPpKxK', '2024-12-31 23:33:13', '1', 0, '2024-12-31 23:37:34', 7, NULL),
(20, 66, 'teamleader@gmail.com', '$2b$10$v21VD/dHFsS60VJJTf04k.RdtLdNpWIqkiO1mTIjvbzOEuE.42ilm', '2025-01-12 22:17:46', '1', 0, '2025-02-21 08:21:26', 7, NULL),
(21, 67, 'hayal@itp.it', '$2b$10$qefqaosG.peJU7AFlD4tL.61yz.TYtP1M0MZCPZq49DpoRACbmObW', '2025-02-15 08:06:02', '1', 0, '2025-04-18 23:22:42', 1, '/uploads/1744549017364-1000068407.jpg'),
(22, 68, 'hayalt@itp.it', '$2b$10$cfR/7GRO7CSppqM8sOd8p.aO8mqJ8JqCbgDgw.12XhH3Qta.suDka', '2025-02-15 08:07:40', '1', 0, '2025-04-12 07:16:26', 8, NULL),
(23, 69, 'registrar@gmail.com', '$2b$10$JFBWyoKSFZPplsOQ2kQwcuprwdR81.YSNq5gtcq4EE1mar.vvuOAC', '2025-03-01 11:34:40', '1', 1, '2025-03-03 22:57:07', 5, NULL),
(24, 70, 'nathan@itp.et', '$2b$10$ZC5FMYA2L2U2mwyA8ecV2OnJ6G4VXQRk4C1lOkSvfCGfpb48a3ig2', '2025-04-03 05:07:01', '1', 0, '2025-04-03 05:07:01', 1, NULL),
(25, 71, 'hayal@gmai.com', '$2b$10$f5OlO3Z5wTJQvzbMJ/sbZudjaSo5aq2Wy/QqDK0B/MEH7HM2wcnGa', '2025-04-03 05:09:23', '1', 0, '2025-04-03 05:09:23', 3, NULL),
(26, 72, 'regist@bus.com', '$2b$10$EmH.IUj7tLqK3/qAzGsYt.7hvgjzDqvq0NXab9B7fQr5nlwAz.7JS', '2025-04-03 05:12:30', '1', 1, '2025-05-03 04:54:04', 5, '/uploads/1745142842358-hayal.jpg'),
(27, 73, 'astu@nathayblog.com', '$2b$10$pZmtDgyj6IXj4gJTiQaUTu549.zUPhP9xSPce0H7Lpv9anBEHH802', '2025-04-03 05:13:57', '1', 0, '2025-04-03 05:13:57', 1, NULL),
(28, 75, 'hager@temechain.com', '$2b$10$ZWHXATmlE53z0PnoW.60N.u96OTbey/3V9KK7Wf2wRFnsz3hRB9xC', '2025-04-03 05:20:08', '1', 0, '2025-04-03 05:20:08', 4, NULL),
(29, 78, 'hager1@temechain.com', '$2b$10$8iuZQYcFRgXSLzxhDZHfyOblndo6zY9WR5CAqjJmMcFDRHqKV/Fuu', '2025-04-03 05:21:50', '1', 0, '2025-04-03 05:21:50', 4, NULL),
(30, 82, 'hager22@temechain.com', '$2b$10$Uz5bqrPC9R7ehMYAeBBgcehj2rsKaAgxljAFeCpeUuG4hKUgoJx.2', '2025-04-04 00:13:08', '1', 0, '2025-04-04 00:13:08', 4, NULL),
(31, 83, 'Hayalt@hu.edu.et', '$2b$10$kO130SYiVzJGTnFOjFj1oe6u9BaqVX4ucxLv8T1lpx8wWAGaq2UmO', '2025-04-12 02:56:33', '1', 0, '2025-04-12 04:05:13', 5, NULL),
(32, 84, 'Nathantamrat50@gmail.com', '$2b$10$5JeSbTmGlCti7b2Tk156fuHYaNCd/5YJ/N0cnZvzmpAhS5/sjDsPu', '2025-04-12 04:36:57', '1', 0, '2025-04-12 04:36:57', 1, NULL),
(33, 85, 'astu@nathayblog.et', '$2b$10$F/KnPiHj/cL7R/HrDSCFwuRgsbLmZRPVDG3nrHk8Hwk21wytxTm.i', '2025-04-12 07:17:22', '1', 0, '2025-04-12 07:17:22', 5, NULL),
(34, 86, 'agent@lonche.com', '$2b$10$w.AmoLlg2mBy2UjMBxIZPuCLsukOK01ho1KmljN1hjPmzT8n4N4cu', '2025-04-16 05:00:29', '1', 1, '2025-04-24 04:50:22', 6, NULL);





















--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`news_item_id`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leased_lands`
--
ALTER TABLE `leased_lands`
  ADD CONSTRAINT `leased_lands_ibfk_1` FOREIGN KEY (`zone_id`) REFERENCES `land_zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `live_event_agenda`
--
ALTER TABLE `live_event_agenda`
  ADD CONSTRAINT `live_event_agenda_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `live_events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `live_event_speakers`
--
ALTER TABLE `live_event_speakers`
  ADD CONSTRAINT `live_event_speakers_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `live_events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offices`
--
ALTER TABLE `offices`
  ADD CONSTRAINT `offices_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `office_buildings` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
