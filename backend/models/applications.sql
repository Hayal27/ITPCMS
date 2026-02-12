-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 10.180.50.141:3306
-- Generation Time: Jan 20, 2026 at 12:19 PM
-- Server version: 5.5.62-log
-- PHP Version: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ethiopni_itpc`
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
  `address` text,
  `linkedin` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `cover_letter` text,
  `education` text,
  `work_experience` text,
  `skills` text,
  `status` enum('pending','reviewing','shortlisted','written_exam','interview_shortlisted','interviewing','offered','rejected') DEFAULT 'pending',
  `admin_notes` text,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `appointment_location` varchar(255) DEFAULT NULL,
  `appointment_lat` decimal(10,8) DEFAULT NULL,
  `appointment_lng` decimal(11,8) DEFAULT NULL,
  `appointment_map_link` text,
  `appointment_details` text,
  `applied_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`job_id`, `tracking_code`, `full_name`, `gender`, `email`, `phone`, `address`, `linkedin`, `portfolio`, `resume_path`, `cover_letter`, `education`, `work_experience`, `skills`, `status`, `admin_notes`, `appointment_date`, `appointment_time`, `appointment_location`, `appointment_lat`, `appointment_lng`, `appointment_map_link`, `appointment_details`, `applied_at`, `updated_at`) VALUES
(1, 'ITPC-AD7F6A', 'Yeamlak Tamrat', 'Male', 'hayaltamrat3@gmail.com', '0913566735', 'Oxfordshire Oxfordshire', 'hayaltamrat3@gmail.com', 'hayaltamrat3@gmail.com', '/uploads/resumes/resume-1768899365890.pdf', 'hayaltamrat3@gmail.com', '[]', '[]', '[\"hayaltamrat3@gmail.com\"]', 'reviewing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-20 08:55:14', '2026-01-20 09:00:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_code` (`tracking_code`),
  ADD KEY `job_id` (`job_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
