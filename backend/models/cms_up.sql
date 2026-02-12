-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 03, 2026 at 08:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cms_up`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
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
  `applied_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `job_id`, `tracking_code`, `full_name`, `gender`, `email`, `phone`, `address`, `linkedin`, `portfolio`, `resume_path`, `cover_letter`, `education`, `work_experience`, `skills`, `status`, `admin_notes`, `appointment_date`, `appointment_time`, `appointment_location`, `appointment_lat`, `appointment_lng`, `appointment_map_link`, `appointment_details`, `applied_at`, `updated_at`) VALUES
(1, 1, 'ITPC-AD7F6A', 'Yeamlak Tamrat', 'Male', 'hayaltamrat3@gmail.com', '0913566735', 'Oxfordshire Oxfordshire', 'hayaltamrat3@gmail.com', 'hayaltamrat3@gmail.com', '/uploads/resumes/resume-1768899365890.pdf', 'hayaltamrat3@gmail.com', '[]', '[]', '[\"hayaltamrat3@gmail.com\"]', 'reviewing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-20 08:55:14', '2026-01-20 09:21:37'),
(2, 1, 'ITPC-7EA439', 'Bereket Tamrat', 'Male', 'hayaltamrat@gmail.com', '0913566735', 'Addis Ababa', 'http://localhost:5173/career', 'http://localhost:5173/career', '/uploads/resumes/resume-1768901155766.pdf', 'http://localhost:5173/career', '[]', '[]', '[\"http://localhost:5173/career\"]', 'written_exam', 'hayaltamrat3@gmail.com', '2026-01-22', '18:41:00', 'encubation g5', 8.96468219, 38.84064005, '', 'hayaltamrat3@gmail.com', '2026-01-20 09:25:04', '2026-01-20 09:40:30'),
(3, 1, 'ITPC-912133', 'Bereket Tamrat', 'Male', 'hayaltamrat@gmail.com', '0913566735', 'Addis Ababa', 'http://localhost:5173/career', 'http://localhost:5173/career', '/uploads/resumes/resume-1768901164940.pdf', 'http://localhost:5173/career', '[]', '[]', '[\"http://localhost:5173/career\"]', 'written_exam', 'hayaltamrat3@gmail.com', '2026-01-22', '18:41:00', 'encubation g5', 8.96468219, 38.84064005, '', 'hayaltamrat3@gmail.com', '2026-01-20 09:25:13', '2026-01-20 09:40:30'),
(4, 1, 'ITPC-2FF28A', 'Bereket Tamrat', 'Male', 'hayaltamrat@gmail.com', '0913566735', 'Addis Ababa', 'http://localhost:5173/career', 'http://localhost:5173/career', '/uploads/resumes/resume-1768901263271.pdf', 'http://localhost:5173/career', '[]', '[]', '[\"http://localhost:5173/career\"]', 'written_exam', 'hayaltamrat3@gmail.com', '2026-01-22', '18:41:00', 'encubation g5', 8.96468219, 38.84064005, '', 'hayaltamrat3@gmail.com', '2026-01-20 09:26:51', '2026-01-20 09:40:30'),
(5, 1, 'ITPC-D7206F', 'Beki Tame', 'Male', 'hayaltamrat3@gmail.com', '0913566735', 'Hawassa', NULL, NULL, '/uploads/resumes/resume-1768901947935.pdf', 'hayaltamrat3@gmail.com', '[]', '[{\"id\":\"1768901929629\",\"companyName\":\"hayaltamrat3@gmail.com\",\"jobTitle\":\"hayaltamrat3@gmail.com\",\"startDate\":\"2023-01\",\"endDate\":\"\",\"isCurrent\":true,\"responsibilities\":\"hayaltamrat3@gmail.com\"}]', '[]', 'written_exam', 'hayaltamrat3@gmail.com', '2026-01-22', '18:41:00', 'encubation g5', 8.96468219, 38.84064005, '', 'hayaltamrat3@gmail.com', '2026-01-20 09:38:16', '2026-01-20 09:40:30');

-- --------------------------------------------------------

--
-- Table structure for table `approvalhierarchy`
--

CREATE TABLE `approvalhierarchy` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `next_role_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 10:15:10'),
(2, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 10:15:11'),
(3, 3, 'UPDATE_STATUS', 'User', NULL, '{\"status\":0}', '127.0.0.1', '2026-01-02 10:22:58'),
(4, 3, 'CREATE', 'User', NULL, '{\"fname\":\"hayal\",\"lname\":\"tamrat\",\"user_name\":\"hayalt\",\"email\":\"hayaltamrat@gmail.com\",\"phone\":\"+25191222112\",\"department_id\":\"1\",\"role_id\":\"1\"}', '127.0.0.1', '2026-01-02 10:27:54'),
(5, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 10:28:18'),
(6, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-02 10:28:23'),
(7, 3, 'UPDATE', 'User', NULL, '{\"fname\":\"some one\",\"lname\":\"agent\",\"user_name\":\"agent@lonche.com\",\"email\":\"agent@lonche.com\",\"phone\":\"itp@123\",\"department_id\":\"1\",\"role_id\":\"6\"}', '127.0.0.1', '2026-01-02 11:31:54'),
(8, 3, 'UPDATE', 'User', NULL, '{\"fname\":\"some one\",\"lname\":\"agent\",\"user_name\":\"agent@lonche.com\",\"email\":\"agent@lonche.com\",\"phone\":\"itp@123\",\"department_id\":\"1\",\"role_id\":\"4\"}', '127.0.0.1', '2026-01-02 11:33:43'),
(9, 3, 'UPDATE', 'User', NULL, '{\"fname\":\"some one\",\"lname\":\"agent\",\"user_name\":\"agent@lonche.com\",\"email\":\"agent@lonche.com\",\"phone\":\"itp@123\",\"department_id\":\"1\",\"role_id\":\"4\"}', '127.0.0.1', '2026-01-02 11:35:03'),
(10, 3, 'UPDATE', 'User', NULL, '{\"fname\":\"some one\",\"lname\":\"some one\",\"user_name\":\"agent@lonche.com\",\"email\":\"agent@lonche.com\",\"phone\":\"itp@123\",\"department_id\":\"1\",\"role_id\":\"4\"}', '127.0.0.1', '2026-01-02 11:35:17'),
(11, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 11:41:15'),
(12, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-02 11:41:57'),
(13, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-02 11:45:34'),
(14, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 12:43:34'),
(15, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 12:45:41'),
(16, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 12:59:24'),
(17, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 13:02:54'),
(18, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 13:12:26'),
(19, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 13:14:49'),
(20, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"onerrr@gmail.com\",\"attempts\":1}', '127.0.0.1', '2026-01-02 13:26:28'),
(21, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 13:26:45'),
(22, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 13:28:03'),
(23, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"onerrr@gmail.com\",\"attempts\":1}', '127.0.0.1', '2026-01-02 13:28:07'),
(24, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"onerrr@gmail.com\",\"attempts\":2}', '127.0.0.1', '2026-01-02 13:28:11'),
(25, 128, 'LOGOUT', 'User', '128', NULL, '127.0.0.1', '2026-01-02 13:35:54'),
(26, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-02 13:36:02'),
(27, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":1}', '127.0.0.1', '2026-01-02 13:48:55'),
(28, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":2}', '127.0.0.1', '2026-01-02 13:48:58'),
(29, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":3}', '127.0.0.1', '2026-01-02 13:49:01'),
(30, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":4}', '127.0.0.1', '2026-01-02 13:49:04'),
(31, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":5}', '127.0.0.1', '2026-01-02 13:49:08'),
(32, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 13:53:53'),
(33, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 13:53:57'),
(34, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":1}', '127.0.0.1', '2026-01-02 13:54:22'),
(35, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":2}', '127.0.0.1', '2026-01-02 13:54:26'),
(36, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":3}', '127.0.0.1', '2026-01-02 13:54:29'),
(37, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":4}', '127.0.0.1', '2026-01-02 13:54:32'),
(38, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":5}', '127.0.0.1', '2026-01-02 13:54:35'),
(39, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-02 14:03:48'),
(40, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-02 14:03:51'),
(41, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":1}', '127.0.0.1', '2026-01-02 14:03:59'),
(42, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":2}', '127.0.0.1', '2026-01-02 14:04:02'),
(43, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":3}', '127.0.0.1', '2026-01-02 14:04:05'),
(44, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":4}', '127.0.0.1', '2026-01-02 14:04:08'),
(45, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"hayalt\",\"attempts\":5}', '127.0.0.1', '2026-01-02 14:04:12'),
(46, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-02 14:21:23'),
(47, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-02 14:21:48'),
(48, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-02 14:22:45'),
(49, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-03 10:34:17'),
(50, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-03 11:09:08'),
(51, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-03 11:09:25'),
(52, 35, 'CREATE', 'Media', '6', '{\"title\":\"our leaders \",\"count\":4}', '127.0.0.1', '2026-01-03 11:10:52'),
(53, 35, 'DELETE', 'Media', '9', NULL, '127.0.0.1', '2026-01-03 11:11:02'),
(54, 3, 'CREATE', 'User', NULL, '{\"fname\":\"yossef\",\"lname\":\"knfe\",\"user_name\":\"yossef\",\"email\":\"yosef@gmail.com\",\"phone\":\"0913566735\",\"department_id\":\"2\",\"role_id\":\"4\"}', '127.0.0.1', '2026-01-03 14:04:12'),
(55, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-03 14:04:19'),
(56, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-03 14:04:51'),
(57, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-03 14:05:07'),
(58, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-03 14:05:17'),
(59, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-03 14:05:47'),
(60, 3, 'LOGIN', 'User', '3', '{\"username\":\"onerrr@gmail.com\"}', '127.0.0.1', '2026-01-03 14:05:56'),
(61, 3, 'LOGOUT', 'User', '3', NULL, '127.0.0.1', '2026-01-03 14:06:21'),
(62, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-03 14:06:32'),
(63, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-03 14:06:51'),
(64, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-03 17:53:30'),
(65, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"yossef\",\"attempts\":1}', '127.0.0.1', '2026-01-03 17:54:00'),
(66, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-03 17:54:09'),
(67, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-03 17:54:29'),
(68, NULL, 'LOGIN_FAILED', 'User', NULL, '{\"username\":\"yossef\",\"attempts\":2}', '127.0.0.1', '2026-01-03 17:54:41'),
(69, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-03 17:55:01'),
(70, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-03 18:17:13'),
(71, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-04 07:15:06'),
(72, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-04 07:15:28'),
(73, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-04 07:15:41'),
(74, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-04 07:21:19'),
(75, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-04 07:21:21'),
(76, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-04 07:29:35'),
(77, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-04 07:29:40'),
(78, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-04 07:30:26'),
(79, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-04 07:30:31'),
(80, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-04 07:43:30'),
(81, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-04 07:43:31'),
(82, 35, 'LOGOUT', 'User', '35', NULL, '127.0.0.1', '2026-01-04 07:47:57'),
(83, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-04 07:48:10'),
(84, 36, 'LOGOUT', 'User', '36', NULL, '127.0.0.1', '2026-01-04 07:53:42'),
(85, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '127.0.0.1', '2026-01-04 07:53:48'),
(86, 36, 'LOGIN', 'User', '36', '{\"username\":\"yossef\"}', '127.0.0.1', '2026-01-04 08:29:21'),
(87, 3, 'LOGOUT', 'User', '3', NULL, '196.189.144.152', '2026-01-05 05:55:25'),
(88, 35, 'LOGIN', 'User', '35', '{\"username\":\"hayalt\"}', '196.189.144.152', '2026-01-05 11:47:33'),
(128, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-01-30 07:56:46'),
(129, 84, 'LOGOUT', 'User', '84', NULL, '::1', '2026-01-30 08:04:03'),
(130, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-01-30 08:04:06'),
(131, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 11:50:29'),
(132, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 11:52:43'),
(133, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 11:59:07'),
(134, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 11:59:37'),
(135, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:01:43'),
(136, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:15:17'),
(137, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:26:29'),
(138, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:34:36'),
(139, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:50:08'),
(140, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 12:51:19'),
(141, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 14:00:44'),
(142, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-02 14:20:22'),
(143, 84, 'LOGIN', 'User', '84', '{\"username\":\"test_admin\"}', '::1', '2026-02-03 06:10:45');

-- --------------------------------------------------------

--
-- Table structure for table `blocked_ips`
--

CREATE TABLE `blocked_ips` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `blocked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `board_members`
--

CREATE TABLE `board_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `english_name` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `board_members`
--

INSERT INTO `board_members` (`id`, `name`, `english_name`, `position`, `bio`, `image_url`, `linkedin`, `twitter`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'ዶ/ር ወርቁ ጋቸና', 'Dr. Werku Gachana', 'የኢትዮጵያ አርቲፊሻል ኢንተለጀንስ ኢንስቲትዩት ዋና ዳይሬክተር እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ ሰብሳቢ', 'ዶ/ር ወርቁ ጋቸና የኢትዮጵያ አርቲፊሻል ኢንተለጀንስ ኢንስቲትዩት ዋና ዳይሬክተር ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ ሰብሳቢ ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767441265230-541817648.jpg', 'https://et.linkedin.com/in/worku-gachena-negera-phd-34472b212', 'https://x.com/muferihata', 1, '2026-01-03 11:41:09', '2026-01-09 06:52:35'),
(2, 'አቶ በለጠ እሱባለው ', 'Belete Esubalew', 'የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ዋና ስራ አስፈጻሚ', 'አቶ በለጠ እሱባለው የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን ዋና ስራ አስፈጻሚ ሆነው በመስራት ላይ ይገኛሉ።', '/images/bele.png', 'https://www.linkedin.com/in/henok-ahmed/', 'https://x.com/henawa2000', 2, '2026-01-03 11:41:09', '2026-01-09 06:53:44'),
(3, 'አቶ ሳንዶካን ደበበ', 'Sandokan Debebe', 'የኢትዮጵያ ኒውክሊየር ኃይል ኮሚሽን ኮሚሽነርና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል ', 'አቶ ሳንዶካን ደበበ የኢትዮጵያ ኒውክሊየር ኃይል ኮሚሽን ኮሚሽነር ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767443352383-986317721.jpg', 'https://www.linkedin.com/posts/sandokan-debebe', 'https://x.com/SandokanDebebe', 4, '2026-01-03 11:41:09', '2026-01-10 22:35:51'),
(4, 'ኢንጂነር ጌቱ ገረመው', 'Eng. Getu Geremew', 'የኢትዮጵያ ኤሌክትሪክ አገልግሎት ዋና ስራ አስፈጻሚ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'ኢንጂነር ጌቱ ገረመው በኢትዮጵያ ኤሌክትሪክ አገልግሎት ዋና ስራ አስፈጻሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/uploads/board-1768085333114-618432099.jpg', '', '', 8, '2026-01-03 11:41:09', '2026-01-10 22:48:01'),
(5, 'ፍሬሕይዎት ታምሩ', 'Frehiwot Tamiru', 'ፍሬሕይዎት ታምሩ የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767443776991-744892929.jpg', 'https://et.linkedin.com/in/frehiwot-tamru-6039654', 'https://twitter.com/frehiwot_tamiru/with_replies', 5, '2026-01-03 11:41:09', '2026-01-09 08:42:38'),
(6, 'አቶ ይድነቃችው ወርቁ', 'Yidenekachew Worku', 'የንግድና ቀጠናዊ ትስስር ሚኒስትር ዴኤታና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል ', 'አቶ ይድነቃችው ወርቁ የንግድና ቀጠናዊ ትስስር ሚኒስትር ዴኤታ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767942323090-150216710.jpg', '', '', 6, NULL, '2026-01-09 08:24:48'),
(7, 'ወ/ሮ ትዕግስት ሃሚድ', 'Tigist Hamid', 'የኢንፎርሜሽን መረብ ደህንነት አስተዳደር ዋና ዳይሬክተርና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል  ', 'ወ/ሮ ትዕግስት ሃሚድ የኢንፎርሜሽን መረብ ደህንነት አስተዳደር ዋና ዳይሬክተር ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767947628816-598104730.jpg', 'https://et.linkedin.com/in/tigist-mohammed-244b9572', 'https://et.linkedin.com/in/tigist-mohammed-244b9572', 7, NULL, '2026-01-09 17:34:58'),
(8, 'ኢንጂነር አሸብር ባልቻ', 'Eng. Ashebir Balcha', 'የኢትዮጵያ ኤሌክትሪክ ኃይል ዋና ሥራ አስፈፃሚ እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል', 'ኢንጂነር አሸብር ባልቻ የኢትዮጵያ ኤሌክትሪክ ኃይል ዋና ሥራ አስፈፃሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767978900881-970258438.jpg', '', '', 9, NULL, '2026-01-10 22:36:34'),
(10, 'አቶ ዝናቡ ይርጋ', 'Zinabu Yirga', 'የኢትዮጵያ ኢንቨስትመንት ኮሚሽን ምክትል ኮሚሽነር እና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል ', 'አቶ ዝናቡ ይርጋ የኢትዮጵያ ኢንቨስትመንት ኮሚሽን ምክትል ኮሚሽነር ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', 'https://api.ethiopianitpark.et/uploads/board-1767980050922-800162484.png', '', '', 10, NULL, '2026-01-10 22:36:47'),
(11, 'ዶ/ር ፍሰሃ ይታገሱ ', 'Dr. Feseha Yetagesu', 'የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈጻሚና የኢ.ቴ.ፓ.ኮ ስራ አመራር ቦርድ አባል ', 'ዶ/ር ፍሰሃ ይታገሱ የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈጻሚ ሆነው በመስራት ላይ ይገኛሉ። በተጨማሪም የኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን የስራ አመራር ቦርድ አባል ናቸው።', '/uploads/board-1768084581126-495167189.jpg', '', '', 2, NULL, '2026-01-10 22:35:29');

-- --------------------------------------------------------

--
-- Table structure for table `cms_menus`
--

CREATE TABLE `cms_menus` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `icon` text DEFAULT NULL,
  `color` varchar(50) DEFAULT 'blue',
  `parent_id` int(11) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `is_section` tinyint(1) DEFAULT 0,
  `is_dropdown` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cms_menus`
--

INSERT INTO `cms_menus` (`id`, `title`, `path`, `icon`, `color`, `parent_id`, `order_index`, `is_section`, `is_dropdown`, `is_active`) VALUES
(0, 'ID Generator', '/tools/id-generator', 'fas fa-id-card', 'indigo', 1, 99, 0, 0, 1),
(1, 'App', NULL, NULL, 'blue', NULL, 10, 1, 0, 1),
(2, 'Content', NULL, NULL, 'blue', NULL, 20, 1, 0, 1),
(3, 'Media', '', '', 'blue', NULL, 30, 1, 0, 0),
(4, 'Interaction', '', '', 'blue', NULL, 40, 1, 0, 1),
(5, 'Appearance', NULL, NULL, 'blue', NULL, 50, 1, 0, 1),
(6, 'Users', NULL, NULL, 'blue', NULL, 60, 1, 0, 1),
(7, 'Settings', '', '', 'blue', NULL, 70, 1, 0, 0),
(8, 'Dashboard', '/dashboard', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z\" /></svg>', 'blue', 1, 11, 0, 1, 1),
(9, 'Overview', '/dashboard/overview', NULL, 'blue', 8, 1, 0, 0, 1),
(10, 'Analytics', '/dashboard/analytics', NULL, 'blue', 8, 2, 0, 0, 1),
(11, 'Posts', '/content/posts', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z\" /></svg>', 'emerald', 2, 21, 0, 1, 1),
(12, 'Add Posts', '/content/posts', '', 'blue', 11, 1, 0, 0, 1),
(13, 'Manage Posts', '/post/managePosts', NULL, 'blue', 11, 2, 0, 0, 1),
(14, 'Gallery', '/post/gallery', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\" /></svg>', 'amber', 2, 22, 0, 1, 1),
(15, 'Gallery Managmet', '/post/gallery', '', 'blue', 14, 1, 0, 0, 1),
(16, 'Manage Gallery', '/post/manageGallery', NULL, 'blue', 14, 2, 0, 0, 0),
(17, 'Pages', '/content/pages', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z\" /></svg>', 'indigo', 2, 23, 0, 0, 0),
(18, 'Categories', '/content/categories', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z\" /></svg>', 'orange', 2, 24, 0, 0, 0),
(19, 'Tags', '/content/tags', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z\" /></svg>', 'pink', 2, 25, 0, 0, 0),
(20, 'Offices', '/content/offices', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4\" /></svg>', 'cyan', 2, 26, 0, 0, 1),
(21, 'Leased Lands', '/content/leased-lands', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 114 0 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>', 'green', 2, 27, 0, 0, 1),
(22, 'Live Events', '/content/live-events', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\" /></svg>', 'red', 2, 28, 0, 0, 1),
(23, 'Careers', '/content/careers', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\" /></svg>', 'blue', 2, 29, 0, 0, 1),
(24, 'Partners & Investors', '/content/partners-investors', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\" /></svg>', 'violet', 2, 30, 0, 0, 1),
(25, 'Incubation', '/content/incubation', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M13 10V3L4 14h7v7l9-11h-7z\" /></svg>', 'blue', 2, 31, 0, 0, 1),
(26, 'Trainings', '/content/trainings', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253\" /></svg>', 'amber', 2, 32, 0, 0, 1),
(27, 'Investment Steps', '/content/investment-steps', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z\" /></svg>', 'teal', 2, 33, 0, 0, 1),
(28, 'Board Members', '/content/board-members', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\" /></svg>', 'purple', 2, 34, 0, 0, 1),
(29, 'Who We Are', '/content/who-we-are', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" /></svg>', 'indigo', 2, 35, 0, 0, 1),
(30, 'Library', '/media/library', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10\" /></svg>', 'purple', 3, 41, 0, 0, 0),
(32, 'Contact', '/interaction/contact', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\" /></svg>', 'blue', 4, 51, 0, 1, 0),
(33, 'Forms', '/interaction/forms', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4\" /></svg>', 'cyan', 4, 52, 0, 1, 1),
(34, 'Contact Inbox', '/interaction/contact-messages', '', 'blue', 4, 1, 0, 0, 1),
(35, 'Investor Inquiries', '/interaction/investor-inquiries', '', 'indigo', 4, 2, 0, 0, 1),
(36, 'Manage Forms', '/interaction/forms/manage', NULL, 'blue', 33, 1, 0, 0, 1),
(37, 'Submissions', '/interaction/forms/submissions', NULL, 'blue', 33, 2, 0, 0, 1),
(38, 'Comments', '/interaction/comments', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z\" /></svg>', 'teal', 4, 53, 0, 0, 1),
(39, 'Menus', '/appearance/menus', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 6h16M4 12h16M4 18h16\" /></svg>', 'rose', 5, 61, 0, 0, 1),
(40, 'Theme', '/appearance/theme-settings', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01\" /></svg>', 'violet', 5, 62, 0, 0, 1),
(41, 'Users', '/users/all', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z\" /></svg>', 'lime', 6, 71, 0, 0, 1),
(42, 'Add User', '/users/add', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z\" /></svg>', 'sky', 6, 72, 0, 0, 1),
(43, 'Subscribers', '/users/subscribers', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\" /></svg>', 'fuchsia', 6, 73, 0, 0, 1),
(44, 'Settings', '/settings/general', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z\" /><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" /></svg>', 'slate', 7, 81, 0, 0, 1),
(45, 'Audit Logs', '/settings/audit-logs', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" /></svg>', 'red', 7, 82, 0, 0, 1),
(46, 'Roles & Permissions', '/users/roles', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" /></svg>', 'indigo', 6, 74, 0, 0, 1),
(47, 'ID Card Registry', '/users/manage-employees', 'fas fa-users-cog', 'blue', 1, 98, 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `news_item_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `news_item_id`, `parent_id`, `name`, `email`, `text`, `created_at`, `approved`) VALUES
(1, 9, NULL, 'hayal', 'hager@temechain.com', 'tets', '2026-01-05 09:03:07', 0),
(2, 9, NULL, 'hayal', 'hayal@gmail.com', 'something', '2025-05-12 18:08:22', 1),
(3, 13, NULL, 'hayal', 'hayalt@gmail.com', 'test', '2025-12-18 16:40:19', 0),
(4, 13, NULL, 'ሃያል', 'hayaltamrat@gmail.com', 'እጅግ ደስ የሚያሰኝ ነው።', '2025-12-22 17:54:20', 1),
(5, 13, 15, 'Admin', 'admin@itpark.com', 'እናመሰግናልን።', '2025-12-22 17:55:44', 1),
(7, 6, NULL, 'hayal ', 'hayltamrat@gmail.com', 'Great!', '2026-01-22 08:23:11', 0);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `message`, `status`, `created_at`) VALUES
(1, 'Beki Tame', 'berekettamrat2015@gmail.com', '+251913566735', 'test', 'read', '2025-12-19 11:32:58'),
(2, 'Bereket Tamrat', 'berekettamrat2015@gmail.com', '+251913566735', 'test', 'read', '2026-01-05 07:38:32'),
(3, 'Beki Tame', 'berekettamrat2015@gmail.com', '+251913566735', 'test', 'read', '2026-01-05 09:19:18'),
(4, 'Beki Tame', 'berekettamrat2015@gmail.com', '+251913566735', 'test', 'read', '2026-01-05 09:31:32'),
(5, 'Hayal', 'onerrr@gmail.com', '', 'Tets', 'read', '2026-01-10 05:48:42'),
(6, 'Mesfin Tsegaye', 'mesfin@mevinai.com', '+251911522902', 'Hello, this is Mesfin, Founder of Mevinai PLC. I’m interested in renting a workspace for our company and would appreciate guidance on the next steps. We’re a growing startup and are looking for an environment that can support our team’s expansion and innovation.', 'read', '2026-01-12 13:19:08'),
(7, 'Mesfin Tsegaye', 'mesfin@mevinai.com', '+251911522902', 'Hello, this is Mesfin, Founder of Mevinai PLC. I’m interested in renting a workspace for our company and would appreciate guidance on the next steps. We’re a growing startup and are looking for an environment that can support our team’s expansion and innovation.', 'read', '2026-01-12 13:19:35'),
(8, 'Hayal Tamrat Girum', 'hayaltamrat3@gmail.com', '+251976180462', 'this is test from hayal\n', 'replied', '2026-01-19 15:09:36'),
(9, 'Dagim Mathewos', 'dmathewos529@gmail.com', '+251903918129', 'Subject: Cooperative Training Placement Request – 5 Web Development & Database Students (Teferi Mekonnen Polytechnic College)\n\nTo:  Ethiopian IT Park (ICT Park) Addis Ababa, Ethiopia\n\nDear Sir/Madam,\n\nWe are writing to formally express our keen interest in undertaking our Cooperative Training (Internship) at the Ethiopian IT Park. We are a group of five (5) dedicated students currently completing our Level 3 certification in Web Development and Database Management at Teferi Mekonnen Polytechnic College.\n\nAs students of one of Ethiopia’s most historic technical institutions, we are eager to bridge the gap between our academic studies and the real-world digital ecosystem. We believe that the Ethiopian IT Park, as the nation\'s premier technology hub, offers the ideal environment for us to refine our technical skills while contributing to the Park\'s digital objectives.\n\nDuring our placement, we are prepared to assist resident companies or the Park administration in the following areas:\n\nWeb Development: Assisting in front-end updates, UI/UX maintenance, and basic web programming (HTML, CSS, JavaScript).\n\nDatabase Management: Supporting data entry, SQL queries, database cleaning, and documentation.\n\nTechnical Support: Aiding in IT infrastructure maintenance and general technical troubleshooting within the Special Economic Zone.\n\nWe are highly motivated, disciplined, and ready to adapt to the fast-paced professional environment of the IT Park. We have attached our institutional recommendation letter from Teferi Mekonnen Polytechnic College for your review.\n\nWe would welcome the opportunity to discuss how we can contribute to your organization during our training period. Thank you for considering our request and for your commitment to empowering the next generation of Ethiopian IT professionals.\n\nSincerely,\n\nStudent Representative Name: Dagim Mathewos Phone Number: +251-903-918-129 College: Teferi Mekonnen Polytechnic College', 'read', '2026-01-26 14:34:42'),
(10, '<script>alert(\'XSS\')</script>', 'test@gmail.com', '<script>alert(\'XSS\')</script>', '<script>alert(\'XSS\')</script>', 'read', '2026-01-29 13:53:36'),
(11, 'Habtam Habtam', 'hayaltamrat@gmail.com', '+359933499097', 'test', 'new', '2026-01-29 19:35:27'),
(12, 'John Doe', 'test@example.com', NULL, 'Normal message', 'read', '2026-02-02 13:41:27');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `name`, `description`, `created_at`) VALUES
(1, 'IT', 'Information Technology Department', '2026-01-02 10:25:30'),
(2, 'HR', 'Human Resources', '2026-01-02 10:25:30'),
(3, 'Finance', 'Finance and Accounts', '2026-01-02 10:25:30'),
(4, 'Marketing', 'Marketing and Public Relations', '2026-01-02 10:25:30');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `fname` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(86, 'agent', 6, 1, 50, 'some one', 'some one', 'agent@lonche.com', 'itp@123', 'M'),
(87, 'hayal tamrat', 1, 1, NULL, 'hayal', 'tamrat', 'hayaltamrat@gmail.com', '+25191222112', NULL),
(88, 'yossef knfe', 4, 2, NULL, 'yossef', 'knfe', 'yosef@gmail.com', '0913566735', NULL),
(89, 'test21 test21', 3, 1, NULL, 'test21', 'test21', 'test21@gmail.com', '', NULL),
(90, 'Hayal Tamrat', 1, 1, NULL, 'Hayal', 'Tamrat', 'kidoastu1993@gmail.com', '0913566735', NULL),
(91, 'nathan tame', 1, 1, NULL, 'nathan', 'tame', 'hayaltamrat3@gmail.com', '0909090909', NULL),
(92, 'test admin', 1, 1, NULL, 'test', 'admin', 'testadmin@gmail.com', '0913566735', NULL),
(93, 'test hr', 4, 2, NULL, 'test', 'hr', 'testhr@gmail.com', '', NULL),
(94, 'test Leasing', 0, 1, NULL, 'test', 'Leasing', 'testleasing@gmail.com', '0913566735', NULL),
(95, 'test conten', 3, 1, NULL, 'test', 'conten', 'testcontent@gmail.com', '0913566735', NULL),
(96, 'test event', 5, 1, NULL, 'test', 'event', 'testevent@gmail.com', '0913566735', NULL),
(97, 'test follow_up', 2, 1, NULL, 'test', 'follow_up', 'testfollowup@gmail.com', '0913566735', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `venue` varchar(255) NOT NULL,
  `image` varchar(2048) NOT NULL,
  `description` text NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `registrationLink` varchar(2048) DEFAULT NULL,
  `capacity` varchar(100) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `youtubeUrl` varchar(2048) DEFAULT NULL,
  `imageAltText` text DEFAULT NULL,
  `comments` int(11) DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `date`, `time`, `venue`, `image`, `description`, `featured`, `registrationLink`, `capacity`, `tags`, `youtubeUrl`, `imageAltText`, `comments`, `createdAt`, `updatedAt`) VALUES
(1, 'ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው', '2025-12-21', '22:48:00', 'ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው', '/uploads/1766411455580-photo_2025-12-22_22-43-39 (2).jpg', '<p>ይህ የ 2030 የዲጂታል ኢትዮጵያ ሎጎ ነው</p>', 0, '', '0', '[]', NULL, NULL, 0, '2025-12-22 13:50:07', '2026-01-19 14:11:08');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `generated_ids`
--

CREATE TABLE `generated_ids` (
  `id` int(11) NOT NULL,
  `content_type` varchar(50) NOT NULL COMMENT 'users, board, applicants',
  `content_id` int(11) NOT NULL,
  `id_no` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Ethiopian',
  `date_of_issue` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `generated_ids`
--

INSERT INTO `generated_ids` (`id`, `content_type`, `content_id`, `id_no`, `name`, `position`, `nationality`, `date_of_issue`, `created_at`) VALUES
(1, 'id_card_person', 3, '1000000', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 12:30:51'),
(2, 'id_card_person', 3, '1000000', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 14:08:15'),
(3, 'id_card_person', 3, '1000000', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 14:50:46'),
(4, 'id_card_person', 3, '1000000', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 20:06:53'),
(5, 'id_card_person', 4, '1000001', 'John Doe', 'Staff', 'Ethiopian', '2026-01-27', '2026-01-27 20:12:49'),
(6, 'id_card_person', 5, '1000002', 'Jane Smith', 'Staff', 'Ethiopian', '2026-01-27', '2026-01-27 20:12:49'),
(7, 'id_card_person', 3, '1000002', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 20:12:49'),
(8, 'id_card_person', 2, '1000000', 'Yeamlak Tamrat', 'Software Dev', 'Ethiopian', '2026-01-26', '2026-01-27 20:12:49'),
(9, 'id_card_person', 1, '0012', 'Bereket Tamrat', 'test', 'Ethiopian', '2026-01-26', '2026-01-27 20:12:49'),
(10, 'id_card_person', 3, '1000000', 'Hayal  Tamrat Girum', 'Software Engineer ', 'Ethiopian', '2026-01-27', '2026-01-27 20:20:05'),
(11, 'id_card_person', 2, '1000000', 'Yeamlak Tamrat', 'Software Dev', 'Ethiopian', '2026-01-26', '2026-01-27 20:20:05'),
(12, 'id_card_person', 1, '0012', 'Bereket Tamrat', 'test', 'Ethiopian', '2026-01-26', '2026-01-27 20:20:05'),
(13, 'id_card_person', 18, '1000005', 'Hayal  Tamrat Girum', 'Software Dev\'t Specialist', 'Ethiopian', '2026-01-27', '2026-01-29 11:57:35'),
(14, 'id_card_person', 18, '1000005', 'Hayal  Tamrat Girum', 'Software Dev\'t Specialist', 'Ethiopian', '2026-01-27', '2026-01-30 07:55:30'),
(15, 'id_card_person', 18, '1000005', 'Hayal  Tamrat Girum', 'Software Dev\'t Specialist', 'Ethiopian', '2026-01-27', '2026-01-30 07:56:06');

-- --------------------------------------------------------

--
-- Table structure for table `id_card_persons`
--

CREATE TABLE `id_card_persons` (
  `id` int(11) NOT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `fname` varchar(100) NOT NULL,
  `lname` varchar(100) NOT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT 'Ethiopian',
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `date_of_issue` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `signature_url` varchar(255) DEFAULT NULL,
  `qr_data` text DEFAULT NULL,
  `custom_field_1_label` varchar(100) DEFAULT NULL,
  `custom_field_1_value` varchar(255) DEFAULT NULL,
  `custom_field_2_label` varchar(100) DEFAULT NULL,
  `custom_field_2_value` varchar(255) DEFAULT NULL,
  `custom_field_3_label` varchar(100) DEFAULT NULL,
  `custom_field_3_value` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fname_am` varchar(255) DEFAULT NULL,
  `lname_am` varchar(255) DEFAULT NULL,
  `position_am` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `id_card_persons`
--

INSERT INTO `id_card_persons` (`id`, `id_number`, `fname`, `lname`, `full_name`, `position`, `department`, `nationality`, `email`, `phone`, `sex`, `date_of_birth`, `date_of_issue`, `expiry_date`, `photo_url`, `signature_url`, `qr_data`, `custom_field_1_label`, `custom_field_1_value`, `custom_field_2_label`, `custom_field_2_value`, `custom_field_3_label`, `custom_field_3_value`, `status`, `notes`, `created_at`, `updated_at`, `fname_am`, `lname_am`, `position_am`) VALUES
(18, '1000005', 'Hayal ', 'Tamrat Girum', NULL, 'Software Dev\'t Specialist', 'Software Development', 'Ethiopian', 'Hayaltamrat@example.com', '0911223344', 'M', NULL, '2026-01-28', '2028-01-28', '/uploads/id-photos/photo-1769606445066-34384266.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '2026-01-28 12:42:58', '2026-01-29 12:03:07', 'ሀያል', 'ታምራት ግሩም', 'የሶፍትዌር ማበልጽግ ባለሙያ');

-- --------------------------------------------------------

--
-- Table structure for table `id_card_templates`
--

CREATE TABLE `id_card_templates` (
  `id` int(11) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `id_card_templates`
--

INSERT INTO `id_card_templates` (`id`, `template_name`, `config`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ITP ID demo', '{\"template_id\":\"corporate\",\"companyName\":\"ETHIOPIAN IT PARK\",\"companyNameAm\":\"የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ \",\"phone\":\"+251-944-666-633\",\"website\":\"www.ethiopianitpark.et\",\"address\":\"Bole, Addis Ababa, Ethiopia\",\"email\":\"info@ethiopianitpark.et\",\"logoLeft\":\"/uploads/id-photos/photo-1769612891145-168083157.png\",\"logoRight\":\"/uploads/id-photos/photo-1769582245869-99003635.png\",\"governor_name\":\"Belete Esubalew\",\"signature_url\":\"/uploads/id-photos/photo-1769600829791-123407280.png\",\"stamp_url\":\"/uploads/id-photos/photo-1769594132993-278723753.png\",\"nationality\":\"Ethiopian\",\"nationality_am\":\"ኢትዮጵያዊ\",\"bg_front_image\":\"/uploads/id-photos/photo-1769670675489-901071082.png\",\"bg_back_image\":\"https://api.ethiopianitpark.et/uploads/id-photos/photo-1769516447330-408163719.png\",\"bg_front_color\":\"#ffffff\",\"bg_back_color\":\"#ffffff\",\"issued_date\":\"2026-01-27\",\"expiry_date\":\"2028-03-27\",\"custom_fields\":[]}', 1, '2026-01-27 11:57:33', '2026-01-29 08:28:25');

-- --------------------------------------------------------

--
-- Table structure for table `incubation_programs`
--

CREATE TABLE `incubation_programs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `stats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incubation_success_stories`
--

INSERT INTO `incubation_success_stories` (`id`, `image_url`, `title`, `description`, `stats`, `link`, `created_at`) VALUES
(1, '/uploads/incubation/1766477710201.jpg', 'IE Network Solutions', '[\"A leading tech company delivering impactful solutions.\",\"Award-winning digital transformation partner.\"]', '[{\"number\":\"250+\",\"label\":\"Completed Projects\"},{\"number\":\"200+\",\"label\":\"Clients Served\"},{\"number\":\"500M+ ETB\",\"label\":\"Annual Revenue\"}]', '/incubation/startups/success', '2025-12-23 08:00:18'),
(2, '/uploads/incubation/1769316726112.jpg', 'Kagool PLC', '[\"A leading global data & analytics consultancy, delivering digital transformation for enterprises.\",\"Located at 2nd Floor, BPO Building, Information Technology Park, Addis Ababa, Ethiopia.\",\"Discover more on their website: kagool.com/about-us\"]', '[{\"number\":\"Global\",\"label\":\"Presence\"},{\"number\":\"20+ Years\",\"label\":\"Experience\"}]', 'https://www.kagool.com/about-us', '2025-12-23 08:00:18'),
(3, '/uploads/incubation/1767983936839.jpeg', 'UNIDO Ethiopia', '[\"The United Nations Industrial Development Organization (UNIDO) drives inclusive and sustainable industrial development.\",\"Active in Ethiopia’s IT Park, supporting innovation and industrial growth.\",\"Learn more: unido.org/about-us/who-we-are\"]', '[{\"number\":\"170+\",\"label\":\"Member States\"},{\"number\":\"1966\",\"label\":\"Established\"}]', 'https://www.unido.org/about-us/who-we-are', '2025-12-23 08:00:18'),
(0, '/uploads/incubation/1769319288550.jpg', 'WEBSPRIX IT SOLUTION PLC', '[\" WebSprix is committed to helping Ethiopia build a stronger information infrastructure and wants to play a critical role in achieving this goal. Taking this into consideration, it is committed to helping Ethiopia build a strong information infrastructure by providing a fibre-based internet service which includes value-added services like IPTV.\"]', '[]', 'https://websprix.com/', '2026-01-25 05:33:56');

-- --------------------------------------------------------

--
-- Table structure for table `investment_resources`
--

CREATE TABLE `investment_resources` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT 'FaFileAlt',
  `file_url` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'document',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `investment_resources`
--

INSERT INTO `investment_resources` (`id`, `label`, `icon`, `file_url`, `type`, `created_at`) VALUES
(0, 'Registration Forms', 'FaFileAlt', '/uploads/invest/1769072262207.docx', 'document', '2026-01-22 08:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `investment_steps`
--

CREATE TABLE `investment_steps` (
  `id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `doc_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `investors`
--

INSERT INTO `investors` (`id`, `investor_id`, `company_name`, `property_name`, `industry_type`, `availability_status`, `zone`, `country`, `description`, `contact_name`, `contact_phone`, `investment_type`, `established_date`, `website`, `image`, `meta_title`, `meta_description`, `meta_keywords`, `slug`, `linkedin`, `twitter`, `facebook`, `created_at`, `updated_at`, `gallery`) VALUES
(1, '1', 'IE Network Solutions', 'Private', 'Technology ', 'Active', 'IT Park, Addis Ababa', 'Ethiopia', 'IE Networks was established in December 2008 and has been involved exclusively in the areas ranging from enterprise network services and business automation intelligence to smart infrastructure and cloud services.', 'Merid', '0913566735', 'IT Infrastructure and Development', '2021-01-21', 'https://www.ienetworksolutions.com/', '/uploads/partners-investors/image-1766430748325-659634768.jpg', 'E Network Solutions | Leading Enterprise IT & Managed Services in Ethiopia', 'With 17+ years of expertise, IE Network Solutions PLC provides end-to-end IT infrastructure, cloud migration, and cybersecurity for Ethiopia’s top government and financial institutions.', 'IE Network Solutions PLC, IE Networks Ethiopia, Meried Bekele IE Networks.', 'IE Network Solution ', 'https://et.linkedin.com/company/ie-network-solutions', 'https://x.com/IE_Networks', 'https://web.facebook.com/ienetworksolutions', '2025-12-22 19:12:28', '2025-12-23 07:21:20', '[\"/uploads/partners-investors/gallery-1766473094500-348102720.jpg\",\"/uploads/partners-investors/gallery-1766473094503-430791884.jpg\",\"/uploads/partners-investors/gallery-1766473094506-86678640.jpg\",\"/uploads/partners-investors/gallery-1766473094518-44877225.jpg\",\"/uploads/partners-investors/gallery-1766473094521-862508506.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `investor_inquiries`
--

CREATE TABLE `investor_inquiries` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `area_of_interest` text DEFAULT NULL,
  `status` enum('pending','read','archived') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `investor_inquiries`
--

INSERT INTO `investor_inquiries` (`id`, `full_name`, `email`, `organization`, `area_of_interest`, `status`, `created_at`) VALUES
(1, 'test', 'hayaltamrat@gmail.com', 'tets', 'hayal', 'pending', '2026-01-03 13:11:01'),
(2, 'Yeamlak Tamrat', 'berekettamrat2015@gmail.com', 'you', 'test', 'pending', '2026-01-03 19:32:16'),
(3, 'Hayal Tamrat Girum', 'hayaltamrat3@gmail.com', 'hayaltamrat3@gmail.com', 'hayaltamrat3@gmail.com', 'pending', '2026-01-19 17:29:16');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `title`, `department`, `location`, `type`, `description`, `responsibilities`, `qualifications`, `start_date`, `deadline`, `status`, `created_at`, `updated_at`) VALUES
(1, 'software developer', 'software development', 'Addis Ababa - Goro (IT PARK)', 'Full-time', 'Job Description:\n\nWe are looking for a skilled and motivated Software Developer to join our team. The ideal candidate will be responsible for designing, developing, testing, and maintaining software applications that meet user and business requirements.\n\nWhat We Offer:\n\nCompetitive salary\n\nProfessional growth and learning opportunities\n\nFriendly and collaborative work environment\n\nFlexible working options (if applicable)', '[\"Key Responsibilities:\",\"\",\"Design, develop, and maintain web or mobile applications\",\"\",\"Write clean, efficient, and well-documented code\",\"\",\"Collaborate with designers, project managers, and other developers\",\"\",\"Debug, test, and improve application performance\",\"\",\"Participate in code reviews and follow best development practices\",\"\",\"Maintain and update existing systems as needed\"]', '[\"Required Skills & Qualifications:\",\"\",\"Bachelor’s degree in Computer Science, Software Engineering, or related field (or equivalent experience)\",\"\",\"Experience with programming languages such as JavaScript, Python, Java, or C#\",\"\",\"Knowledge of web technologies (HTML, CSS, React, Node.js, etc.)\",\"\",\"Understanding of databases (MySQL, PostgreSQL, MongoDB, etc.)\",\"\",\"Familiarity with version control systems (Git)\",\"\",\"Strong problem-solving and analytical skills\"]', '2026-01-12', '2026-01-21', 'closed', '2025-12-22 07:43:26', '2026-01-20 09:58:09'),
(2, 'Senior Software Engineer (Full Stack)', 'Engineering', 'Addis Ababa, Ethiopia', 'Full-time', 'We are looking for a world-class Full Stack Engineer to build the future of our digital infrastructure.', '[\"Architect scalable microservices\",\"Lead frontend modernization\",\"Optimize DB performance\"]', '[\"5+ years React/Node experience\",\"Strong SQL skills\",\"Cloud native mindset\"]', '2025-12-23', '2026-01-20', 'closed', '2025-12-22 07:51:32', '2026-01-30 08:06:43'),
(0, 'Senior Cyber Security Expert', 'Cyber Security', 'Addis Ababa', 'Full-time', 'Job Description\nEthiopian IT Park is seeking a highly skilled Senior Cyber Security Expert to lead the protection of our digital infrastructure, systems, and data. The role involves designing, implementing, and monitoring security frameworks, managing cyber risks, and ensuring compliance with national and international security standards.', '[\"\"]', '[\"Bachelor’s or Master’s degree in Cyber Security, Computer Science, or a related field\",\"\",\"5+ years of hands-on experience in cyber security or information security\",\"\",\"Strong knowledge of network security, SOC operations, incident response, and risk management\",\"\",\"Experience with security tools (SIEM, IDS/IPS, firewalls, endpoint security)\",\"\",\"Familiarity with ISO 27001, NIST, or similar security standards\",\"\",\"Relevant certifications (CISSP, CISM, CEH, or equivalent) are an advantage\",\"\",\"Strong analytical, leadership, and communication skills\"]', '2026-01-18', '2026-01-18', 'closed', NULL, '2026-01-20 09:31:26');

-- --------------------------------------------------------

--
-- Table structure for table `land_zones`
--

CREATE TABLE `land_zones` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_size_sqm` decimal(15,2) DEFAULT 0.00,
  `available_size_sqm` decimal(15,2) DEFAULT 0.00,
  `icon_name` varchar(100) DEFAULT 'FaGlobeAfrica',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leased_lands`
--

INSERT INTO `leased_lands` (`id`, `zone_id`, `land_type`, `location`, `size_sqm`, `available_size_sqm`, `status`, `leased_by`, `leased_from`, `contact_name`, `contact_phone`, `created_at`, `updated_at`) VALUES
('LND-ICTA-202', 1, 'Commercial', 'Behind ICT Tower A', 1500.00, 1200.00, 'Leased', NULL, '2025-05-31', 'Belete Esubalew', '+251913456789', '2025-12-21 14:56:49', '2026-01-30 08:05:52'),
('LND-ICTA-203', 2, 'Commercial', 'East Wing, ICT Park', 2200.00, 0.00, 'Leased', 'TechEthiopia Solutions', '2025-01-15', 'Belete Esubalew', '+251911234567', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
('LND-ICTA-204', 3, 'Industrial', 'Near Main Entrance', 3000.00, 1800.00, 'Available', NULL, '2025-07-01', 'Belete Esubalew', '+251944567890', '2025-12-21 14:56:49', '2025-12-21 14:56:49'),
('LND-ICTA-205', 4, 'Commercial', 'North Section', 1800.00, 1200.00, 'Available', NULL, '2025-08-15', 'Belete Esubalew', '+251922345678', '2025-12-21 14:56:49', '2025-12-21 14:56:49');

-- --------------------------------------------------------

--
-- Table structure for table `live_events`
--

CREATE TABLE `live_events` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_streaming` tinyint(1) DEFAULT 0,
  `is_recording` tinyint(1) DEFAULT 0,
  `recording_url` varchar(255) DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `signaling_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `live_events`
--

INSERT INTO `live_events` (`id`, `title`, `subtitle`, `description`, `event_date`, `start_time`, `end_time`, `timezone`, `location`, `stream_platform`, `stream_url`, `stream_poster`, `stream_aspect`, `chat_enabled`, `chat_pinned`, `estimated_viewers`, `status`, `created_at`, `updated_at`, `is_streaming`, `is_recording`, `recording_url`, `actual_start_time`, `signaling_data`) VALUES
(1, 'ITPC Hub Innovation Summit 2025', 'Exploring the future of Ethiopia\'s Digital Economy', NULL, '2025-12-13', '09:30:00', '17:00:00', 'UTC', 'Main Exhibition Hall, Addis Ababa', 'youtube', '', 'https://images.unsplash.com/photo-1540575861501-7ad060e1c415?auto=format&fit=crop&q=80', '16:9', 1, NULL, 0, 'ended', '2025-12-21 15:19:17', '2026-01-29 14:19:05', 0, 0, NULL, '2026-01-04 17:04:32', '{\"type\":\"offer\",\"sdp\":{\"type\":\"offer\",\"sdp\":\"v=0\\r\\no=- 5913015373708301636 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0 1\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS 25aa56ae-2589-4b4a-8aa2-c28946891578\\r\\nm=audio 19565 UDP/TLS/RTP/SAVPF 111 63 9 0 8 13 110 126\\r\\nc=IN IP4 196.189.144.6\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=candidate:878227986 1 udp 2122260223 192.168.65.1 59391 typ host generation 0 network-id 1\\r\\na=candidate:2570080246 1 udp 2122194687 192.168.19.1 59392 typ host generation 0 network-id 2\\r\\na=candidate:1973121577 1 udp 2122129151 192.168.56.1 59393 typ host generation 0 network-id 4\\r\\na=candidate:1904945384 1 udp 2122063615 10.223.126.103 59394 typ host generation 0 network-id 3 network-cost 10\\r\\na=candidate:3404883590 1 tcp 1518280447 192.168.65.1 9 typ host tcptype active generation 0 network-id 1\\r\\na=candidate:1738185570 1 tcp 1518214911 192.168.19.1 9 typ host tcptype active generation 0 network-id 2\\r\\na=candidate:2335286973 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 4\\r\\na=candidate:2401369212 1 tcp 1518083839 10.223.126.103 9 typ host tcptype active generation 0 network-id 3 network-cost 10\\r\\na=candidate:3879947825 1 udp 1685855999 196.189.144.6 19565 typ srflx raddr 10.223.126.103 rport 59394 generation 0 network-id 3 network-cost 10\\r\\na=ice-ufrag:5Kio\\r\\na=ice-pwd:YZmIZl22KDOtVH/yYJh2SGQs\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 BC:09:8C:C9:09:99:27:7B:8B:D7:C1:D9:D2:8F:97:58:29:79:69:8E:07:08:DC:B7:79:83:B9:3E:9B:A0:A3:C9\\r\\na=setup:actpass\\r\\na=mid:0\\r\\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\\r\\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\\r\\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\\r\\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=sendrecv\\r\\na=msid:25aa56ae-2589-4b4a-8aa2-c28946891578 3525c91f-3b3d-4efe-b96f-41d7470c8dd1\\r\\na=rtcp-mux\\r\\na=rtcp-rsize\\r\\na=rtpmap:111 opus/48000/2\\r\\na=rtcp-fb:111 transport-cc\\r\\na=fmtp:111 minptime=10;useinbandfec=1\\r\\na=rtpmap:63 red/48000/2\\r\\na=fmtp:63 111/111\\r\\na=rtpmap:9 G722/8000\\r\\na=rtpmap:0 PCMU/8000\\r\\na=rtpmap:8 PCMA/8000\\r\\na=rtpmap:13 CN/8000\\r\\na=rtpmap:110 telephone-event/48000\\r\\na=rtpmap:126 telephone-event/8000\\r\\na=ssrc:870331714 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:870331714 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 3525c91f-3b3d-4efe-b96f-41d7470c8dd1\\r\\nm=video 46855 UDP/TLS/RTP/SAVPF 96 97 103 104 107 108 109 114 115 116 117 118 39 40 45 46 98 99 100 101 119 120 49 50 123 124 125\\r\\nc=IN IP4 196.189.144.6\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=candidate:878227986 1 udp 2122260223 192.168.65.1 59395 typ host generation 0 network-id 1\\r\\na=candidate:2570080246 1 udp 2122194687 192.168.19.1 59396 typ host generation 0 network-id 2\\r\\na=candidate:1973121577 1 udp 2122129151 192.168.56.1 59397 typ host generation 0 network-id 4\\r\\na=candidate:1904945384 1 udp 2122063615 10.223.126.103 59398 typ host generation 0 network-id 3 network-cost 10\\r\\na=candidate:3404883590 1 tcp 1518280447 192.168.65.1 9 typ host tcptype active generation 0 network-id 1\\r\\na=candidate:1738185570 1 tcp 1518214911 192.168.19.1 9 typ host tcptype active generation 0 network-id 2\\r\\na=candidate:2335286973 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 4\\r\\na=candidate:2401369212 1 tcp 1518083839 10.223.126.103 9 typ host tcptype active generation 0 network-id 3 network-cost 10\\r\\na=candidate:3879947825 1 udp 1685855999 196.189.144.6 46855 typ srflx raddr 10.223.126.103 rport 59398 generation 0 network-id 3 network-cost 10\\r\\na=ice-ufrag:5Kio\\r\\na=ice-pwd:YZmIZl22KDOtVH/yYJh2SGQs\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 BC:09:8C:C9:09:99:27:7B:8B:D7:C1:D9:D2:8F:97:58:29:79:69:8E:07:08:DC:B7:79:83:B9:3E:9B:A0:A3:C9\\r\\na=setup:actpass\\r\\na=mid:1\\r\\na=extmap:14 urn:ietf:params:rtp-hdrext:toffset\\r\\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\\r\\na=extmap:13 urn:3gpp:video-orientation\\r\\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\\r\\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\\r\\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\\r\\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\\r\\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\\r\\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\\r\\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\\r\\na=sendrecv\\r\\na=msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\na=rtcp-mux\\r\\na=rtcp-rsize\\r\\na=rtpmap:96 VP8/90000\\r\\na=rtcp-fb:96 goog-remb\\r\\na=rtcp-fb:96 transport-cc\\r\\na=rtcp-fb:96 ccm fir\\r\\na=rtcp-fb:96 nack\\r\\na=rtcp-fb:96 nack pli\\r\\na=rtpmap:97 rtx/90000\\r\\na=fmtp:97 apt=96\\r\\na=rtpmap:103 H264/90000\\r\\na=rtcp-fb:103 goog-remb\\r\\na=rtcp-fb:103 transport-cc\\r\\na=rtcp-fb:103 ccm fir\\r\\na=rtcp-fb:103 nack\\r\\na=rtcp-fb:103 nack pli\\r\\na=fmtp:103 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\\r\\na=rtpmap:104 rtx/90000\\r\\na=fmtp:104 apt=103\\r\\na=rtpmap:107 H264/90000\\r\\na=rtcp-fb:107 goog-remb\\r\\na=rtcp-fb:107 transport-cc\\r\\na=rtcp-fb:107 ccm fir\\r\\na=rtcp-fb:107 nack\\r\\na=rtcp-fb:107 nack pli\\r\\na=fmtp:107 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f\\r\\na=rtpmap:108 rtx/90000\\r\\na=fmtp:108 apt=107\\r\\na=rtpmap:109 H264/90000\\r\\na=rtcp-fb:109 goog-remb\\r\\na=rtcp-fb:109 transport-cc\\r\\na=rtcp-fb:109 ccm fir\\r\\na=rtcp-fb:109 nack\\r\\na=rtcp-fb:109 nack pli\\r\\na=fmtp:109 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\\r\\na=rtpmap:114 rtx/90000\\r\\na=fmtp:114 apt=109\\r\\na=rtpmap:115 H264/90000\\r\\na=rtcp-fb:115 goog-remb\\r\\na=rtcp-fb:115 transport-cc\\r\\na=rtcp-fb:115 ccm fir\\r\\na=rtcp-fb:115 nack\\r\\na=rtcp-fb:115 nack pli\\r\\na=fmtp:115 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f\\r\\na=rtpmap:116 rtx/90000\\r\\na=fmtp:116 apt=115\\r\\na=rtpmap:117 H264/90000\\r\\na=rtcp-fb:117 goog-remb\\r\\na=rtcp-fb:117 transport-cc\\r\\na=rtcp-fb:117 ccm fir\\r\\na=rtcp-fb:117 nack\\r\\na=rtcp-fb:117 nack pli\\r\\na=fmtp:117 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\\r\\na=rtpmap:118 rtx/90000\\r\\na=fmtp:118 apt=117\\r\\na=rtpmap:39 H264/90000\\r\\na=rtcp-fb:39 goog-remb\\r\\na=rtcp-fb:39 transport-cc\\r\\na=rtcp-fb:39 ccm fir\\r\\na=rtcp-fb:39 nack\\r\\na=rtcp-fb:39 nack pli\\r\\na=fmtp:39 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=4d001f\\r\\na=rtpmap:40 rtx/90000\\r\\na=fmtp:40 apt=39\\r\\na=rtpmap:45 AV1/90000\\r\\na=rtcp-fb:45 goog-remb\\r\\na=rtcp-fb:45 transport-cc\\r\\na=rtcp-fb:45 ccm fir\\r\\na=rtcp-fb:45 nack\\r\\na=rtcp-fb:45 nack pli\\r\\na=fmtp:45 level-idx=5;profile=0;tier=0\\r\\na=rtpmap:46 rtx/90000\\r\\na=fmtp:46 apt=45\\r\\na=rtpmap:98 VP9/90000\\r\\na=rtcp-fb:98 goog-remb\\r\\na=rtcp-fb:98 transport-cc\\r\\na=rtcp-fb:98 ccm fir\\r\\na=rtcp-fb:98 nack\\r\\na=rtcp-fb:98 nack pli\\r\\na=fmtp:98 profile-id=0\\r\\na=rtpmap:99 rtx/90000\\r\\na=fmtp:99 apt=98\\r\\na=rtpmap:100 VP9/90000\\r\\na=rtcp-fb:100 goog-remb\\r\\na=rtcp-fb:100 transport-cc\\r\\na=rtcp-fb:100 ccm fir\\r\\na=rtcp-fb:100 nack\\r\\na=rtcp-fb:100 nack pli\\r\\na=fmtp:100 profile-id=2\\r\\na=rtpmap:101 rtx/90000\\r\\na=fmtp:101 apt=100\\r\\na=rtpmap:119 H264/90000\\r\\na=rtcp-fb:119 goog-remb\\r\\na=rtcp-fb:119 transport-cc\\r\\na=rtcp-fb:119 ccm fir\\r\\na=rtcp-fb:119 nack\\r\\na=rtcp-fb:119 nack pli\\r\\na=fmtp:119 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\\r\\na=rtpmap:120 rtx/90000\\r\\na=fmtp:120 apt=119\\r\\na=rtpmap:49 H265/90000\\r\\na=rtcp-fb:49 goog-remb\\r\\na=rtcp-fb:49 transport-cc\\r\\na=rtcp-fb:49 ccm fir\\r\\na=rtcp-fb:49 nack\\r\\na=rtcp-fb:49 nack pli\\r\\na=fmtp:49 level-id=93;profile-id=1;tier-flag=0;tx-mode=SRST\\r\\na=rtpmap:50 rtx/90000\\r\\na=fmtp:50 apt=49\\r\\na=rtpmap:123 red/90000\\r\\na=rtpmap:124 rtx/90000\\r\\na=fmtp:124 apt=123\\r\\na=rtpmap:125 ulpfec/90000\\r\\na=ssrc-group:FID 1811404858 3192608943\\r\\na=ssrc:1811404858 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:1811404858 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\na=ssrc:3192608943 cname:KQxkOIlfFCHsMfC3\\r\\na=ssrc:3192608943 msid:25aa56ae-2589-4b4a-8aa2-c28946891578 adbe3c42-35be-489f-a1dd-7ea406826750\\r\\n\"},\"from\":\"admin\"}');

-- --------------------------------------------------------

--
-- Table structure for table `live_event_agenda`
--

CREATE TABLE `live_event_agenda` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `time` time NOT NULL,
  `title` varchar(255) NOT NULL,
  `speaker` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `type` enum('image','video') NOT NULL,
  `description` text DEFAULT NULL,
  `src` varchar(1024) NOT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `youtube_url_original` varchar(1024) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `media_gallery`
--

INSERT INTO `media_gallery` (`id`, `title`, `date`, `category`, `type`, `description`, `src`, `poster`, `youtube_url_original`, `created_at`, `updated_at`) VALUES
(5, 'Digital Ethiopia Logo', '2025-12-21', 'Technology', 'image', '<p>ይህ የዲጂታል ኢትዮጵያ ሎጎ ነው</p>', '/uploads/1766418769835-photo_2025-12-22_22-43-39 (2).jpg', '/uploads/1766418769837-photo_2025-12-22_22-43-39 (2).jpg', NULL, '2025-12-22 15:43:18', '2025-12-22 15:52:49'),
(6, 'ITPC Deputy Ceo', '2025-12-31', 'Community', 'image', '<p>Ethiopian IT Park Deputy Ceo</p>', '/uploads/1767438651935-535250025.png', '/uploads/1767438652042-413085794.png', NULL, '2026-01-03 11:10:52', '2026-01-18 17:56:22'),
(8, 'Ethiopian IT Park ', '2026-01-02', 'Community', 'image', '<p>Ethiopian IT Park </p>', '/uploads/1767438651999-757409881.png', '/uploads/1767438652042-413085794.png', NULL, '2026-01-03 11:10:52', '2026-01-18 17:56:47');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `image` varchar(2048) NOT NULL,
  `description` text NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `readTime` varchar(50) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `comments` int(11) DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `youtubeUrl` varchar(255) DEFAULT NULL,
  `imageAltText` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `date`, `category`, `image`, `description`, `featured`, `readTime`, `tags`, `comments`, `createdAt`, `updatedAt`, `youtubeUrl`, `imageAltText`) VALUES
(1, 'Ethiopian IT Park extends its heartfelt greetings to all Ethiopian Orthodox Tewahedo Christians on the blessed occasion of Timket, the Ethiopian Christian Epiphany.', '2026-01-20', 'Community Engagement', '[\"/uploads/1768728741610-990290517.png\"]', '<p>ለመላው የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ክርስቲያን እንኳን ለከተራ በዓል እና ለብርሀነ ጥምቀቱ በሰላም አደረሳችሁ።</p><p>ጥምቀት የጌታችን ኢየሱስ ክርስቶስ በዮርዳኖስ ወንዝ መጠመቁን የሚያስታውስ ታላቅ መንፈሳዊ በዓል ሲሆን፣ የእምነት፣ የንጽሕና፣ የአንድነትና ምልክት ነው።</p><p>በዚህ ክቡር በአል፣ የኢትዮጵያ አይቲ ፓርክ ለመላው የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ክርስቲያን መልካም በአል ይመኛል።</p><p>እንኳን ለጥምቀት በዓል በሰላም አደረሳችሁ !</p><p>ሰላም፣ በረከትና ፍቅር ይብዛላችሁ።</p><p>— ኢትዮጵያ አይቲ ፓርክ</p><p><br></p><p>Ethiopian IT Park extends its heartfelt greetings to all Ethiopian Orthodox Tewahedo Christians on the blessed occasion of Timket, the Ethiopian Christian Epiphany.</p><p>Timket commemorates the baptism of our Lord Jesus Christ in the River Jordan and stands as a powerful symbol of faith, purity, unity, and Ethiopia’s rich spiritual heritage, proudly recognized by UNESCO as an Intangible Cultural Heritage.</p><p>On this holy day, Ethiopian IT Park honors the spiritual and cultural values that continue to foster peace, unity, and shared purpose among our people. May this celebration bring renewal, joy, and prosperity to our nation and beyond.</p><p>Happy Timket!</p><p>May peace and blessings be with you all.</p><p>— Ethiopian IT Park</p>', 0, '10', '[\"hashtag#techtalent hashtag#ethiopianitpark\"]', 0, NULL, '2026-01-19 17:50:59', NULL, ''),
(2, 'አዲስ አመራሮች ከኢንፎርሜሽን ቴክኖሎጂ ፓርክ አልሚ ድርጅቶች  ጋር ተወያዩ', '2025-12-16', 'Government Initiatives', '[\"/uploads/1766410294126-photo_2025-12-22_22-30-37.jpg\",\"/uploads/1766410294128-photo_2025-12-22_22-30-39.jpg\",\"/uploads/1766410294130-photo_2025-12-22_22-30-42.jpg\",\"/uploads/1766410294132-photo_2025-12-22_22-30-43.jpg\",\"/uploads/1766410294135-photo_2025-12-22_22-30-52.jpg\"]', '<p>አዲስ አመራሮች ከኢንፎርሜሽን ቴክኖሎጂ ፓርክ አልሚ ድርጅቶች ጋር ተወያዩ...</p><p>የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ ኮርፖሬሽን አዲስ አመራሮች፣ ከፓርኩ ነዋሪዎች ጋር የመጀመሪያ የሆነ የትውውቅና የውይይት መድረክ አካሂደዋል። ይህ በዋና ስራ አስፈጻሚው አቶ በለጠ እሱባለው እና በምክትላቸው አቶ ኦላና አበበ የተመራው መድረክ፣ አመራሮቹ አልሚ ድርጅቶች በይፋ ለመተዋወቅና የነዋሪዎችን ሀሳብ ለመስማት ያለመ ነበር።</p><p>በውይይቱ ላይ ተሳታፊ የነበሩት አልሚ ድርጅቶች የፓርኩን ጠንካራ ጎኖች በመጠቆም እንዲሁም መስተካከል አለባቸው ያሏቸውን ጉዳዮች በማንሳት ለአዲሶቹ አመራሮች ግብዓት ሰጥተዋል። አልሚ ድርጅቶቹ ያነሷቸውን ሀሳቦችና አስተያየቶች ተከትሎ፣ አመራሮቹ ማብራሪያ ሰጥተዋል፡፡ አከለዉም \"ይህ የትውውቅ መድረክ የመጀመሪያችን ነው\" በማለት አንዳንድ ጉዳዮችን በጠባብ መድረኮች ሰፋ ያለ ውይይት በማድረግ የሚፈቱ ጉዳዮች እንደሚኖሩም ገልጸዋል።</p><p>በመጨረሻም በተነሱት ችግሮች ላይ ተጨባጭ መፍትሄ ለማምጣት ከአልሚ ድርጅቶች ጋር በጋራ እንደሚሰሩ ያረጋገጡ ሲሆን፣ ሁሉም የፓርኩ አልሚ ድርጅቶች ለስነ-ምህዳሩ እድገት የበኩሉን አስተዋፅኦ እንዲያበረክት ጥሪ አቅርበዋል።</p>', 0, '10', '[\"#ITPC #PMOEthiopia  #striving_for_eco_industrial_park #industrialpark\"]', 0, '2025-05-10 20:57:34', '2026-01-19 14:11:08', NULL, NULL),
(3, 'ዲጂታል ኢትዮጵያ 2025 ሙሉ ለሙሉ በሚባል ደረጃ የታለመለትን ግብ አሳክቶ ተጠናቋል', '2025-12-20', 'Strategic Partnerships', '[\"/uploads/1766409846968-photo_2025-12-22_22-21-00.jpg\",\"/uploads/1766409846970-photo_2025-12-22_22-21-02.jpg\",\"/uploads/1766409846973-photo_2025-12-22_22-21-59.jpg\",\"/uploads/1766409846984-photo_2025-12-22_22-22-22.jpg\"]', '<p>ዲጂታል ኢትዮጵያ<strong><em><u> 2025 ሙሉ ለሙሉ</u></em></strong> በሚባል ደረጃ የታለመለትን ግብ አሳክቶ ተጠናቋል። በዛሬው እለትም ዲጂታል ኢትዮጵያ 2030 በይፋ አስጀምረናል። ተደራሽነትን ማስፋት፣ ለዜጎች እኩል እድል መፍጠር እንዲሁም በዜጎችና ተቋማት መካከል መተማመንን ማጎልበት ደግሞ የስትራቴጂው ቁልፍ መሰረታዊ ትልሞች ናቸው።</p>', 0, '4', '[\"#ITPC#PMOEthiopia  #striving_for_eco_industrial_park\"]', 0, '2025-12-18 16:33:26', '2026-01-19 14:11:08', 'https://www.youtube.com/watch?v=buC1-gn6rPw', NULL),
(4, 'በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በዲጅታል አማራጭ ለገበያ ለማቅረብ የሚያስችል ስምምነት ተፈረመ', '2025-12-15', 'Strategic Partnerships', '[\"/uploads/1766409349232-photo_2025-12-22_22-14-09.jpg\",\"/uploads/1766409349243-photo_2025-12-22_22-14-14.jpg\",\"/uploads/1766409349249-photo_2025-12-22_22-14-16.jpg\",\"/uploads/1766409349250-photo_2025-12-22_22-14-18.jpg\"]', '<p>በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በዲጅታል አማራጭ ለገበያ ለማቅረብ የሚያስችል ስምምነት ተፈረመ</p><p>የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን እና ኢትዮ ቴሌኮም በልዩ የኢኮኖሚ ዞኖች የሚመረቱ ምርቶችን በ\'ዘመን ገበያ\' ለሀገር ውስጥ ገበያተኞች ለማቅረብ የሚያስችል ስምምነት ተፈራርመዋል::</p><p>የስምምነት ፊርማውን የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈፃሚ ፍሰሃ ይታገሱ (ዶ/ር) እና የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚ ፍሬህይወት ታምሩ ተፈራርመዋል::</p><p>በፊርማ ስነ-ስርዓቱ የመክፈቻ ንግግር ያደረጉት የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን ዋና ስራ አስፈፃሚ ፍሰሃ ይታገሱ (ዶ/ር) በመላው ሃገሪቱ በሚገኙ ልዩ የኢኮኖሚ ዞኖችና ኢንዱስትሪ ፓርኮች ውስጥ የሚገኙ አምራቾች ምርቶቻቸውን ወደ ዘመን ገበያ በማስገባት፤ በዓለም አቀፍ ገበያ ተወዳጅና ትልቅ ስም ያላቸው ምርቶችን፣ ለሀገር ውስጥ ሸማቾች ለማቅረብ ከማስቻሉ በተጨማሪ ዲጅታል ኢትዮጵያን እውን ለማድረግ በሃገራችን አንጋፋ ከሆነው ሃገራዊ ተቋም ኢትዮ ቴሌኮም ጋር በመፈራረማችን ደስታ ይሰማናል ብለዋል፡፡</p><p>ዶ/ር ፍስሃ በተጨማሪም ስምምነቱ በዲጂታል ግብይት ዘርፍ የዲጂታል 2030 ስትራቴጂን ውጤታማ ለማድረግ የሚያግዝና በጅምር ላይ የሚገኘውን የሃገራችን የኤሌክትሮኒክ የግብይት ስርዓት በመደበኛነት ለማስቀጠል ትልቅ ዕድል መፍጠር ያስችላል ብለዋል።</p><p>የኢትዮ ቴሌኮም ዋና ስራ አስፈጻሚ ፍሬህይወት ታምሩ በበኩላቸው የሀገራችን የግብይት ሥርዓት በዲጂታል በማዘመን ወደ ላቀ ምዕራፍ ለማሸጋገር የሚያስችል፣ ሁሉን አቀፍ እና አካታች የሆነውን \'ዘመን ገበያ\' የተሰኘ ዘመናዊ የዲጂታል ግብይት ፕላትፎርም ማስጀመሩን ገልጸው በልዩ የኢኮኖሚ ዞኖች የሚገኙ አምራቾችም ፕላትፎርሙን ተጠቅመው ምርቶቻቸውን በሰፊው የማስተዋወቅና አስተማማኝ የገበያ ትስስር በመፍጠር አጠቃላይ የሀገራችንን የንግድ ሥነ ምህዳር ወደ ዘመናዊና ተወዳዳሪ ደረጃ ለማሸጋገር ያለመ ነው ብለዋል::</p><p>ስምምነቱ በልዩ የኢኮኖሚ ዞኖች የሚገኙ አምራቾች የኤክስፖርት ደረጃቸውን የጠበቁ ምርቶቻቸውን በስፋትና በተቀላጠፈ ሁኔታ ተደራሽ እንዲያደርጉ ያግዛል ተብሏል::</p><p>የኢንዱስትሪ ፓርኮች ልማት ኮርፖሬሽን በመላው ሃገሪቱ ገንብቶ በሚያስተዳድራቸው 11 ልዩ የኢኮኖሚ ዞኖችና 3 ኢንዱስትሪ ፓርኮች ውስጥ ከ 200 በላይ ትልልቅ ስምና ዝና ያላቸው አምራቾች ያሉ ሲሆን ኢትዮ ቴሌኮም ከአፍሪካ ግንባር ቀደም የተቀናጀና የቴሌኮም እና የዲጂታል መፍትሄዎች አቅራቢ ኩባንያ ነው::</p>', 0, '5 min read', '[\"hashtag#techtalent hashtag#ethiopianitpark\"]', 0, '2025-12-19 08:19:02', '2026-01-19 14:11:08', 'https://www.youtube.com/watch?v=gUV0bRZzAoU&list=RDdc5983-LrFk&index=4', NULL),
(6, 'The new Board of Directors of the Ethiopian Information Technology Park Corporation held its meeting today the 15th of January 2026.', '2026-01-15', 'Government Initiatives', '[\"/uploads/1768842927560-916765013.jpg\",\"/uploads/1768842927560-191022230.jpg\",\"/uploads/1768842927561-129793284.jpg\",\"/uploads/1768842927563-875551813.jpg\",\"/uploads/1768842927563-59613562.jpg\",\"/uploads/1768842927564-840050366.jpg\",\"/uploads/1768842927565-24269208.jpg\",\"/uploads/1768842927566-621880806.jpg\"]', '<p class=\"ql-align-justify\"><span style=\"color: rgba(0, 0, 0, 0.9);\">The new Board of Directors of the Ethiopian Information Technology Park Corporation held its meeting today the 15th of January 2026. </span></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span style=\"color: rgba(0, 0, 0, 0.9);\">The Ethiopian Information Technology Park Corporation is established with Regulation Number 177/2010 and hosts government entities and over 80 domestic and foreign investors employing over 3,500 employees. Following the assignment of new management members, new board members have been assigned to the park. </span></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span style=\"color: rgba(0, 0, 0, 0.9);\">The Board of Directors are, </span><a href=\"https://www.linkedin.com/company/etartificialintelligenceinstitute/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ethiopian Artificial Intelligence Institute</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Director General His Excellency Dr. Engineer </span><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23worku&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Worku</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Gatchena, Board Chairman, </span><a href=\"https://www.linkedin.com/company/ipdcethiopiaofficial/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Industrial Parks Development Corporation - Ethiopia</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> CEO, His Excellency Dr. </span><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23feseha&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Feseha</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Yetagessu, Ethiopian </span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23nuclear&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Nuclear</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Energy Commission His Excellency </span><a href=\"https://www.linkedin.com/in/sandokan-debebe-40a66b4a/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Sandokan Debebe</a><span style=\"color: rgba(0, 0, 0, 0.9);\">, </span><a href=\"https://www.linkedin.com/company/information-network-security-administration/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Information Network Security Administration</a><span style=\"color: rgba(0, 0, 0, 0.9);\">, Director General, Her Excellency </span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23tigist&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Tigist</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Hamid, </span><a href=\"https://www.linkedin.com/in/ministry-of-trade-and-regional-integration-of-ethiopia-139a81225/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ministry of Trade and Regional Integration of Ethiopia</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> State Minister His Excellency </span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23yidnekachew&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Yidnekachew</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Worku, </span><a href=\"https://www.linkedin.com/company/ethio-telecom/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">ethio telecom</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Chief Executive Officer, Her Excellency </span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23firehiwot&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Firehiwot</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Tamiru, </span><a href=\"https://www.linkedin.com/company/ethiopian-electric-utility/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ethiopian Electric Utility</a><span style=\"color: rgba(0, 0, 0, 0.9);\">,&nbsp;Chief Executive Officer His Excellency Engineer </span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23getu&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Getu</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Geremew, </span><a href=\"https://www.linkedin.com/company/ethiopianelectricpower/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ethiopian Electric Power - የኢትዮጵያ ኤሌክትሪክ ኃይል</a><span style=\"color: rgba(0, 0, 0, 0.9);\">, Director General His Excellency Engineer</span></p><p class=\"ql-align-justify\"><a href=\"https://www.linkedin.com/search/results/all/?keywords=%23ashebur&amp;origin=HASH_TAG_FROM_FEED\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ashebur</a><span style=\"color: rgba(0, 0, 0, 0.9);\"> Balcha, </span><a href=\"https://www.linkedin.com/company/ethiopian-investment-commission/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ethiopian Investment Commission (EIC)</a><span style=\"color: rgba(0, 0, 0, 0.9);\">, Deputy Commissioner His Excellency </span><a href=\"https://www.linkedin.com/in/zinabu-yirga-4a411782/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">zinabu yirga</a><span style=\"color: rgba(0, 0, 0, 0.9);\">. </span></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span style=\"color: rgba(0, 0, 0, 0.9);\">The Board held its first meeting today and discussed and evaluated the Strategic Plan of the </span><a href=\"https://www.linkedin.com/company/ethiopianitpark/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(10, 102, 194); background-color: rgba(0, 0, 0, 0);\">Ethiopian IT Park</a><span style=\"color: rgba(0, 0, 0, 0.9);\">, the 2018 Budget year 6-month performance, mega projects planned by the Park, and investment bottlenecks at the Park. The Board Chairperson, His Excellency Dr. Engineer Worku Gatchena highlighted the major obstacles at the park and gave direction on solutions.</span></p>', 1, '1000', '[\"innovative\"]', 0, '2026-01-19 17:14:35', '2026-01-19 17:14:35', NULL, NULL);

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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offices`
--

INSERT INTO `offices` (`id`, `zone`, `building_id`, `unit_number`, `floor`, `size_sqm`, `status`, `price_monthly`, `rented_by`, `available_from`, `contact_name`, `contact_phone`, `created_at`, `updated_at`) VALUES
('OFF-ICTA-305', 'Tech Innovation Zone', 1, 'A305', 4, 85.00, 'Available', 18750.00, NULL, '2025-05-31', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2026-01-30 08:05:34'),
('OFF-ICTA-402', 'Tech Innovation Zone', 1, 'A402', 4, 95.00, 'Available', 20000.00, NULL, '2025-07-01', 'Belete Esubalew', '+251911223344', '2025-12-21 14:34:14', '2025-12-21 14:34:14');

-- --------------------------------------------------------

--
-- Table structure for table `office_buildings`
--

CREATE TABLE `office_buildings` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_offices` int(11) DEFAULT 0,
  `available_offices` int(11) DEFAULT 0,
  `total_size_sqm` decimal(10,2) DEFAULT 0.00,
  `icon_name` varchar(100) DEFAULT 'FaBuilding',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `office_buildings`
--

INSERT INTO `office_buildings` (`id`, `name`, `description`, `total_offices`, `available_offices`, `total_size_sqm`, `icon_name`, `created_at`, `updated_at`) VALUES
(1, 'Encubation', 'Premium office spaces designed for tech companies and startups with modern amenities and high-speed internet.', 50, 30, 4500.00, 'FaBuilding', '2025-12-21 14:34:14', '2025-12-21 14:48:59'),
(5, 'BPO', 'BPO Zone', 7, 6, 2332.00, 'FaBuilding', '2025-12-21 14:43:48', '2025-12-21 14:43:48');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `partner_id`, `company_name`, `contact_name`, `contact_email`, `partnership_type`, `country`, `zone`, `industry_type`, `agreement_start_date`, `agreement_end_date`, `status`, `services_provided`, `logo`, `description`, `meta_title`, `meta_description`, `meta_keywords`, `slug`, `website`, `linkedin`, `twitter`, `facebook`, `created_at`, `updated_at`, `gallery`) VALUES
(1, '1', 'MINT(Mister of Inovation and Technology)', 'Bereket Tamrat', 'berekettamrat2015@gmail.com', 'Government', 'Ethiopia', 'IT Park, Addis Ababa', 'Technology ', NULL, NULL, 'Active', '[\"Gov\'t\"]', '/uploads/partners-investors/logo-1766428975531-195184812.jpg', 'Ministry of Innovation and Technology (MInT) former Ministry of Science and Technology is a governmental institution that established for the first time in December 1975 by proclamation No.62/1975 as a commission. Following the change in government in 1991 and with the issuance of the new economic policy, the Commission was re-established in March 1994 by Proclamation No.91/94. The commission went into its 3rd phase of re-institution on the 24th of August 1995 by Proclamation No.7/1995, following the establishment of Federal Democratic Republic of Ethiopia as an Agency.\r\nLater on, in 2008 the government upgraded the Agency as one of the Cabinet ministries accountable to the prime minister and the council of ministers by the proclamation No. 604/2008 and re established recently too in October 2010 according to definition of powers and duties of the executive organs of the Federal Democratic Republic of Ethiopia proclamation No. 691/2010.', 'Ministry of Innovation and Technology', 'Ministry of Innovation and Technology (MInT) former Ministry of Science and Technology is a governmental institution that established for the first time in December 1975 by proclamation No.62/1975 as a commission. Following the change in government in 1991 and with the issuance of the new economic policy, the Commission was re-established in March 1994 by Proclamation No.91/94. The commission went into its 3rd phase of re-institution on the 24th of August 1995 by Proclamation No.7/1995, following the establishment of Federal Democratic Republic of Ethiopia as an Agency.\r\nLater on, in 2008 the government upgraded the Agency as one of the Cabinet ministries accountable to the prime minister and the council of ministers by the proclamation No. 604/2008 and re established recently too in October 2010 according to definition of powers and duties of the executive organs of the Federal Democratic Republic of Ethiopia proclamation No. 691/2010.', 'Ministry of Innovation and Technology, Ministry of Innovation, mint.gov.et', 'mint.gov.et, MINT, Ministry of Innovation and Technology,Ministry of Science and Technology', 'https://www.mint.gov.et/', 'https://et.linkedin.com/company/ministry-of-innovation-and-technology-ethiopia', 'https://x.com/MinistryofInno2', 'https://web.facebook.com/MInT.Ethiopia', '2025-12-22 18:34:35', '2025-12-23 06:47:05', '[\"/uploads/partners-investors/gallery-1766472425176-103052208.jpg\",\"/uploads/partners-investors/gallery-1766472425231-295078810.jpg\",\"/uploads/partners-investors/gallery-1766472425232-73020013.jpg\",\"/uploads/partners-investors/gallery-1766472425233-32263675.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `revoked_tokens`
--

CREATE TABLE `revoked_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `status`) VALUES
(1, 'Admin', 1),
(2, 'Investor follow-up', 1),
(3, 'Content Creator', 1),
(4, 'HR', 1),
(5, 'Event Orig', 1),
(0, 'Leasing', 1);

-- --------------------------------------------------------

--
-- Table structure for table `role_menu_permissions`
--

CREATE TABLE `role_menu_permissions` (
  `role_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_menu_permissions`
--

INSERT INTO `role_menu_permissions` (`role_id`, `menu_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 32),
(1, 34),
(1, 35),
(1, 38),
(1, 39),
(1, 41),
(1, 42),
(1, 43),
(1, 45),
(1, 46),
(4, 23),
(4, 9),
(4, 10),
(4, 8),
(5, 22),
(5, 9),
(5, 10),
(5, 8),
(3, 12),
(3, 13),
(3, 16),
(3, 9),
(3, 15),
(3, 10),
(3, 8),
(3, 14),
(0, 20),
(0, 21),
(0, 9),
(0, 10),
(0, 8),
(2, 35),
(2, 9),
(2, 10),
(2, 8),
(2, 4),
(2, 34),
(1, 0),
(1, 47);

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('active','unsubscribed') DEFAULT 'active',
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscribers`
--

INSERT INTO `subscribers` (`id`, `email`, `status`, `subscribed_at`, `unsubscribed_at`) VALUES
(1, 'hayaltamrat@gmail.com', 'active', '2025-12-19 08:07:31', NULL),
(4, 'hayaltamrat1@gmail.com', 'active', '2025-12-19 08:13:22', NULL),
(5, 'hayaltamrat4@gmail.com', 'active', '2026-01-03 11:18:11', NULL),
(6, 'hayaltamrat5@gmail.com', 'active', '2026-01-05 06:08:14', NULL),
(7, 'berekettamrat2015@gmail.com', 'active', '2026-01-05 06:19:46', NULL),
(8, 'hayalt5@gmail.com', 'active', '2026-01-05 07:35:38', NULL),
(9, 'hayaltamrat6@gmail.com', 'active', '2026-01-05 07:38:04', NULL),
(10, 'hayaltamrat123@gmail.com', 'active', '2026-01-05 07:39:35', NULL),
(11, 'astu@nathayblog.com', 'active', '2026-01-05 08:53:24', NULL),
(12, 'berekettamrat20115@gmail.com', 'active', '2026-01-05 08:55:14', NULL),
(13, 'astuw@nathayblog.com', 'active', '2026-01-05 09:03:44', NULL),
(14, 'kidoastu1993@gmail.com', 'active', '2026-01-05 09:11:40', NULL),
(15, 'kidoastu19293@gmail.com', 'active', '2026-01-05 09:31:45', NULL),
(16, 'worket2@gmail.com', 'active', '2026-01-05 09:38:34', NULL),
(17, 'worketh20172@gmail.com', 'active', '2026-01-05 09:39:59', NULL),
(18, 'hager@temechain.com', 'active', '2026-01-05 10:01:00', NULL),
(19, 'bereketeab550@gmail.com', 'active', '2026-01-05 10:22:08', NULL),
(20, 'berekettamrat20154@gmail.com', 'active', '2026-01-06 04:38:05', NULL),
(21, 'fekadualemu208@gmail.com', 'active', '2026-01-08 07:13:49', NULL),
(22, 'super@gmail.com', 'active', '2026-01-09 04:56:42', NULL),
(23, 'somchaibinl@gmail.com', 'active', '2026-01-09 15:27:10', NULL),
(24, 'natha@gmail.com', 'active', '2026-01-09 18:55:42', NULL),
(25, 'onertrr@gmail.com', 'active', '2026-01-11 07:04:03', NULL),
(26, 'alemu.abera@ethiopianitpark.et', 'active', '2026-01-12 11:33:37', NULL),
(27, 'kedirahmed19963384@gmail.com', 'active', '2026-01-12 12:17:52', NULL),
(28, 'matthewarop@gmail.com', 'active', '2026-01-13 06:12:35', NULL),
(29, 'sirajdeldebo96@gmail.com', 'active', '2026-01-14 10:25:37', NULL),
(30, 'hayaltamrat8@gmail.com', 'active', '2026-01-15 10:31:21', NULL),
(31, 'mchala04@gmail.com', 'active', '2026-01-18 00:53:59', NULL),
(32, 'hayaltamrat23@gmail.com', 'active', '2026-01-19 16:24:52', NULL),
(33, 'hayaltamrat3@gmail.com', 'active', '2026-01-19 16:32:37', NULL),
(34, 'tsehayutilahun@gmail.com', 'active', '2026-01-20 08:25:12', NULL),
(35, 'kirubelmulugeta3@gmail.com', 'active', '2026-01-24 05:37:40', NULL),
(36, 'na@gmail.com', 'active', '2026-01-29 19:48:18', NULL),
(37, 'na1@gmail.com', 'active', '2026-01-29 19:48:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `training_workshops`
--

CREATE TABLE `training_workshops` (
  `id` int(11) NOT NULL,
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
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` enum('Upcoming','Ongoing','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `user_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `status` enum('1','0') DEFAULT '1',
  `online_flag` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `account_locked_until` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `redemption_token` varchar(255) DEFAULT NULL,
  `redemption_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `user_name`, `password`, `created_at`, `status`, `online_flag`, `updated_at`, `role_id`, `avatar_url`, `failed_login_attempts`, `account_locked_until`, `reset_token`, `reset_token_expires`, `redemption_token`, `redemption_token_expires`) VALUES
(1, 21, 'www', '$2b$10$wr58QSzvz/HWVMz5U8ttv.RQTQOkHMEf2S/SkYOt2eD9sTsAeQtuy', '2024-11-06 11:46:34', '1', 0, '2024-11-11 04:13:18', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 43, 'eeee44e@gmail.com', '$2b$10$AV7kZtfFlQwS7c34ryaCx.vgwWb7jy0pPqhDpT2Sxa/Vd5YakkEuK', '2024-11-10 23:08:20', '1', 0, '2024-11-25 00:38:43', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(3, 45, 'onerrr@gmail.com', '$2a$10$waN95Oh4Ac59P4eZylyemONRgGLcLlxLHm6Xt6i6RpnSeKFa.nHrW', '2024-11-10 23:18:44', '1', 0, '2026-01-22 07:26:39', 1, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(4, 46, 'woya@gmail.com', '$2b$10$OD8jd/hPB7ZcH9GJy9Pr/.ovNiO1QVNCgFbrcrXULwcH7kp.qdq.S', '2024-11-10 23:59:47', '1', 0, '2024-11-11 05:47:43', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 48, 'hl@gmail.com', '$2b$10$Q1KieAzu4fFS0dwh6Vxty.GOgUu8xL2SyAaS1Vis9DkeMQxSt30Pq', '2024-11-11 22:30:13', '1', 0, '2024-11-11 22:30:13', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 49, 'yonas@itp.org', '$2b$10$ktd.Y1lVFq4EOyoKkDZnhu6yJ1JNWBykmrpmFUKMBsSo4b4/IP/7K', '2024-11-11 23:41:28', '1', 0, '2024-11-20 04:42:44', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 50, 'simegn@itp.org', '$2b$10$6SbuHMtP7XMbwVdakqMr1eTCY9QIhHxabIBHgI.CZpN9wqROs8rr6', '2024-11-11 23:44:17', '1', 1, '2025-04-17 11:19:49', NULL, '/uploads/1744466201370-photo_2024-12-21_09-16-01.jpg', 0, NULL, NULL, NULL, NULL, NULL),
(8, 51, 'hayal@itp.org', '$2b$10$8QrTeqaPBAnLZXdCHqzkMuoxgUc63IWsXMR6Qfn8FtaQ9kjaJCyWm', '2024-11-11 23:45:43', '1', 1, '2025-05-10 17:36:12', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 54, 'hayalt@itp.org', '$2b$10$fiYp77BQuhOk9eZDl77hROkL7aEYeyLZPojgbfij/YpVo0B6IVENi', '2024-11-11 23:46:31', '1', 0, '2024-11-12 03:28:01', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 55, 'abe@itp.et', '$2b$10$6Ptxn.bGG6WonQvgi08ZVeWOKhIf414AU.Rf8biKg5DM5w6.t6R2W', '2024-11-12 03:52:54', '1', 1, '2024-11-13 00:03:58', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 56, 'beki33333333333@gmail.com', '$2b$10$IWJvw/rD3F5c75O71ue3JepPiTXnxsZeiUYygfRFDYGfZqeMF.IPK', '2024-11-12 03:56:31', '1', 0, '2024-11-12 03:56:31', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 57, 'staf@gmail.com', '$2b$10$Wvcpmhed2gaCmaVQH3dEZeykZqhum/Szobc3rRweHGIhpzKO.Rxha', '2024-11-12 03:59:33', '1', 0, '2024-11-14 04:26:14', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 58, 'nebyat@itp.et', '$2b$10$5X.XMQQMRay/6zJDdEReI.MLzAcq.ed9xBk5OO4UELVvaG2fckm5K', '2024-11-14 01:06:52', '1', 0, '2025-04-12 05:53:03', 6, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 59, 'ewunetu@itp.et', '$2b$10$KPHuhuIPciZ.cVg0BBCK7egMKZQqsXsNGzX/Xq4C0nBzUEEsTj62u', '2024-11-14 01:08:04', '1', 1, '2024-12-30 12:02:02', 7, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(15, 60, 'manager@itp.et', '$2b$10$YC.zK8u88DfkTI.fTL7I2eZkFV0jTSPb7I3IVl99z0htdWzu9/qdW', '2024-11-14 01:34:28', '1', 0, '2024-11-19 22:29:05', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(16, 62, 'staf1@itp.et', '$2b$10$lQ6KmKDb38sqinMsHODD8Ocj3vR/s5y1R5EfHVaT8lCPAqULU.9i6', '2024-11-14 05:27:48', '1', 0, '2025-04-04 07:49:05', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(17, 63, 'berrrrrki@gmail.com', '$2b$10$44MGUjABmQFL6C39kRH.wevHAvA0URLNg0NiGjhSVMQEZLJ92VFTa', '2024-11-22 03:02:23', '1', 0, '2024-11-22 03:02:23', 6, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(18, 64, 'eeee@gmail.com', '$2b$10$At9MAsh2IMjheS6B5znOmOeVCR9glbD8gKFUsKmF/mIKEqHv5P3FO', '2024-11-24 23:59:11', '1', 0, '2024-11-24 23:59:11', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(19, 65, 'teaml@gmail.com', '$2b$10$JoeJGvKXSfm.k0e43w0f2ujj1WWrzCZs40TF9NeqAKpWFZSQPpKxK', '2024-12-31 23:33:13', '1', 0, '2024-12-31 23:37:34', 7, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(20, 66, 'teamleader@gmail.com', '$2b$10$v21VD/dHFsS60VJJTf04k.RdtLdNpWIqkiO1mTIjvbzOEuE.42ilm', '2025-01-12 22:17:46', '1', 0, '2025-02-21 08:21:26', 7, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(21, 67, 'hayal@itp.it', '$2b$10$qefqaosG.peJU7AFlD4tL.61yz.TYtP1M0MZCPZq49DpoRACbmObW', '2025-02-15 08:06:02', '1', 0, '2025-04-18 23:22:42', 1, '/uploads/1744549017364-1000068407.jpg', 0, NULL, NULL, NULL, NULL, NULL),
(22, 68, 'hayalt@itp.it', '$2b$10$cfR/7GRO7CSppqM8sOd8p.aO8mqJ8JqCbgDgw.12XhH3Qta.suDka', '2025-02-15 08:07:40', '1', 0, '2025-04-12 07:16:26', 8, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(23, 69, 'registrar@gmail.com', '$2b$10$JFBWyoKSFZPplsOQ2kQwcuprwdR81.YSNq5gtcq4EE1mar.vvuOAC', '2025-03-01 11:34:40', '1', 1, '2025-03-03 22:57:07', 5, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(24, 70, 'nathan@itp.et', '$2b$10$ZC5FMYA2L2U2mwyA8ecV2OnJ6G4VXQRk4C1lOkSvfCGfpb48a3ig2', '2025-04-03 05:07:01', '1', 0, '2025-04-03 05:07:01', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(25, 71, 'hayal@gmai.com', '$2b$10$f5OlO3Z5wTJQvzbMJ/sbZudjaSo5aq2Wy/QqDK0B/MEH7HM2wcnGa', '2025-04-03 05:09:23', '1', 0, '2025-04-03 05:09:23', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(26, 72, 'regist@bus.com', '$2b$10$EmH.IUj7tLqK3/qAzGsYt.7hvgjzDqvq0NXab9B7fQr5nlwAz.7JS', '2025-04-03 05:12:30', '1', 1, '2025-05-03 04:54:04', 5, '/uploads/1745142842358-hayal.jpg', 0, NULL, NULL, NULL, NULL, NULL),
(27, 73, 'astu@nathayblog.com', '$2b$10$pZmtDgyj6IXj4gJTiQaUTu549.zUPhP9xSPce0H7Lpv9anBEHH802', '2025-04-03 05:13:57', '', 0, '2026-01-22 13:52:47', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(28, 75, 'hager@temechain.com', '$2b$10$ZWHXATmlE53z0PnoW.60N.u96OTbey/3V9KK7Wf2wRFnsz3hRB9xC', '2025-04-03 05:20:08', '', 0, '2026-01-22 13:52:43', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(29, 78, 'hager1@temechain.com', '$2b$10$8iuZQYcFRgXSLzxhDZHfyOblndo6zY9WR5CAqjJmMcFDRHqKV/Fuu', '2025-04-03 05:21:50', '', 0, '2026-01-22 13:52:40', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(30, 82, 'hager22@temechain.com', '$2b$10$Uz5bqrPC9R7ehMYAeBBgcehj2rsKaAgxljAFeCpeUuG4hKUgoJx.2', '2025-04-04 00:13:08', '', 0, '2026-01-22 13:52:38', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(31, 83, 'Hayalt@hu.edu.et', '$2b$10$kO130SYiVzJGTnFOjFj1oe6u9BaqVX4ucxLv8T1lpx8wWAGaq2UmO', '2025-04-12 02:56:33', '1', 0, '2025-04-12 04:05:13', 5, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(32, 84, 'Nathantamrat50@gmail.com', '$2b$10$5JeSbTmGlCti7b2Tk156fuHYaNCd/5YJ/N0cnZvzmpAhS5/sjDsPu', '2025-04-12 04:36:57', '1', 0, '2025-04-12 04:36:57', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(33, 85, 'astu@nathayblog.et', '$2b$10$F/KnPiHj/cL7R/HrDSCFwuRgsbLmZRPVDG3nrHk8Hwk21wytxTm.i', '2025-04-12 07:17:22', '', 0, '2026-01-22 13:52:26', 5, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(34, 86, 'agent@lonche.com', '$2b$10$tJfgUyeyD1SuZw7Fb2cZj.C2F7AOBtuxMYWV7iFq1XkMVt.l39ray', '2025-04-16 05:00:29', '', 1, '2026-01-22 13:52:08', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(35, 87, 'hayalt', '$2a$10$jMz/EPXp07CLlKRGGTX09.acntIn/cEzku16KDBGjMyL8fcnRZJx6', '2026-01-02 19:27:54', '1', 0, '2026-01-20 14:10:12', 1, NULL, 5, '2026-01-20 11:02:52', NULL, NULL, '428543', '2026-01-20 11:47:52'),
(36, 88, 'yossef', '$2b$10$GN/aBZv/1706lzslMW0JsOu9BxZ0hsyfY5ajmpOsujA.YubRCqBvm', '2026-01-03 23:04:12', '1', 1, '2026-01-04 17:29:21', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(37, 0, 'testcontent', '$2b$10$aRshM322N4pt78QV4PWqu.MQPaoOHTAe4O87XMMB2HLc3.aN1UhCy', NULL, '1', 1, '2026-01-14 07:39:22', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(38, 0, 'testcontent', '$2b$10$7IwUi/dItdTzJa3yabOBxujhQX8ca7WAI2px..6E/Rvg6qGTolO8W', NULL, '1', 1, '2026-01-14 07:39:22', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(39, 0, 'testcontent', '$2b$10$rCM9FIvafFojaivIvf.2Fum62q00EAE1njiWBK11YiysQxeHkhc8u', NULL, '1', 1, '2026-01-14 07:39:22', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(40, 0, 'testcontent', '$2b$10$oe.vSMpP1C7Mqh9PYeoqz.x5JKXsUFOZ6NQS5sPJ0x34CKSnUNaSO', NULL, '1', 1, '2026-01-14 07:39:22', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(41, 0, 'habtamu', '$2b$10$qBfGxGxC1QxArB59gKF3lOCDH4iFaX8yPsu1g1pJtYT8JIyd65KLy', NULL, '1', 1, '2026-01-14 07:45:59', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(42, 0, 'alex123', '$2b$10$SZghtWdY/ElqtD5eBPDlKOzYvq7cgEwnZ3Q44/J/wSgfyx8/JHB6K', NULL, '1', 1, '2026-01-14 07:45:59', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(79, 0, 'abe', '$2b$10$LLKK9aNESzflQws8xgiOyeeyux/ogS0/LLuFs9QNn/o7gX4qCoHLe', NULL, '1', 0, '2026-01-18 15:17:30', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(80, 0, 'tsu', '$2b$10$zoRAB4Jag/XFGn4qVdpVIO5y4jD1/Jx.qfLq8IeOYHFz0FfPRdDOC', NULL, '1', 0, '2026-01-18 15:23:50', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(81, 89, 'test21', '$2b$10$cOBQjS35hPfMfuCi3mcl5urpgYRipicj3UThVl1mjN4cpA0yy4qWS', NULL, '1', 0, '2026-01-19 11:53:18', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(82, 90, 'hayal27', '$2a$10$llnOoM.g2U0TBY01.O9m/etuwNwtnx8Y9K194f/zd3b.ocLIAjIRi', NULL, '1', 0, '2026-01-19 14:27:03', 1, NULL, 2, NULL, NULL, NULL, NULL, NULL),
(83, 91, 'nathan27', '$2a$10$.CQJhD65g9BWbe7KF0ggtOMoGQxVIMWzvoRSX3qCa5Y.XnVuSWEiC', NULL, '1', 0, '2026-01-22 14:23:42', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(84, 92, 'test_admin', '$2y$10$AGwbryQ1p4GWjD0eVCxW7ePylM6eDw011y6KFmd94IJb5SdwPKlLC', NULL, '1', 1, '2026-01-30 08:04:06', 1, NULL, 0, NULL, NULL, NULL, '893516', '2026-01-22 11:29:27'),
(85, 93, 'test_hr', '$2b$10$B8gJhs3y9Mc0u7RL7eqEau2KVYnYiJFNXEc./GTAWCZ7O8LuCAvTy', NULL, '1', 0, '2026-01-26 06:19:51', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(86, 94, 'test_leasing', '$2b$10$i1jat15pi2/cP/uojFDEdOrKHfrSXl1pGzSpHxobCfj0AkiY8T5NG', NULL, '1', 0, '2026-01-26 06:20:55', 0, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(87, 95, 'test_content', '$2b$10$sBbnMlLhyp1od2Gu1.pYw.BXPUE/gprppvDF.hxQ2JVGsuNrxdbCK', NULL, '1', 0, '2026-01-26 06:22:42', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(88, 96, 'test_event', '$2b$10$gdmpCBKH0bh3e5zrkn.xIOECh/NBVzYDl8ZsEYL6bDEHNic5DiNoy', NULL, '1', 0, '2026-01-21 13:03:30', 5, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(89, 97, 'test_follow_up', '$2b$10$gz.g/ZceL1lUdD75bnu4E.oRqcdezgs4zl5JzgUJV16HLipXxAafa', NULL, '1', 1, '2026-01-26 06:26:30', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_menu_permissions`
--

CREATE TABLE `user_menu_permissions` (
  `user_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `permission_type` enum('allow','deny') NOT NULL DEFAULT 'allow'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_menu_permissions`
--

INSERT INTO `user_menu_permissions` (`user_id`, `menu_id`, `permission_type`) VALUES
(34, 1, 'deny'),
(34, 2, 'deny'),
(34, 3, 'deny'),
(34, 4, 'deny'),
(34, 5, 'deny'),
(34, 6, 'deny'),
(34, 7, 'deny'),
(34, 8, 'deny'),
(34, 9, 'allow'),
(34, 10, 'deny'),
(34, 11, 'deny'),
(34, 12, 'deny'),
(34, 13, 'deny'),
(34, 14, 'deny'),
(34, 15, 'deny'),
(34, 16, 'deny'),
(34, 17, 'deny'),
(34, 18, 'deny'),
(34, 19, 'deny'),
(34, 20, 'deny'),
(34, 21, 'deny'),
(34, 22, 'deny'),
(34, 24, 'deny'),
(34, 25, 'deny'),
(34, 26, 'deny'),
(34, 27, 'deny'),
(34, 28, 'deny'),
(34, 29, 'deny'),
(34, 30, 'deny'),
(34, 32, 'deny'),
(34, 33, 'deny'),
(34, 34, 'deny'),
(34, 35, 'deny'),
(34, 36, 'deny'),
(34, 37, 'deny'),
(34, 38, 'deny'),
(34, 39, 'deny'),
(34, 40, 'deny'),
(34, 41, 'deny'),
(34, 42, 'deny'),
(34, 43, 'deny'),
(34, 44, 'deny'),
(34, 45, 'deny'),
(34, 46, 'deny'),
(36, 23, 'allow'),
(0, 15, 'allow'),
(0, 34, 'allow'),
(0, 36, 'allow'),
(0, 10, 'allow'),
(0, 13, 'allow'),
(0, 26, 'allow'),
(0, 27, 'allow'),
(0, 28, 'allow'),
(0, 4, 'allow'),
(0, 29, 'allow'),
(0, 46, 'allow'),
(0, 43, 'allow'),
(0, 42, 'allow'),
(0, 41, 'allow'),
(0, 7, 'allow'),
(0, 40, 'allow'),
(0, 39, 'allow'),
(0, 44, 'allow'),
(0, 45, 'allow'),
(0, 9, 'allow'),
(0, 12, 'allow'),
(81, 15, 'allow'),
(81, 12, 'allow'),
(81, 13, 'allow'),
(81, 16, 'allow'),
(89, 35, 'allow'),
(89, 34, 'allow'),
(89, 32, 'allow'),
(89, 10, 'allow'),
(84, 9, 'allow'),
(84, 12, 'allow'),
(84, 15, 'allow'),
(84, 34, 'allow'),
(84, 36, 'allow'),
(84, 10, 'allow'),
(84, 13, 'allow'),
(84, 16, 'allow'),
(84, 35, 'allow'),
(84, 37, 'allow'),
(84, 1, 'allow'),
(84, 8, 'allow'),
(84, 2, 'allow'),
(84, 11, 'allow'),
(84, 14, 'allow'),
(84, 17, 'allow'),
(84, 18, 'allow'),
(84, 19, 'allow'),
(84, 20, 'allow'),
(84, 21, 'allow'),
(84, 22, 'allow'),
(84, 23, 'allow'),
(84, 3, 'allow'),
(84, 24, 'allow'),
(84, 25, 'allow'),
(84, 26, 'allow'),
(84, 27, 'allow'),
(84, 28, 'allow'),
(84, 29, 'allow'),
(84, 4, 'allow'),
(84, 30, 'allow'),
(84, 5, 'allow'),
(84, 32, 'allow'),
(84, 33, 'allow'),
(84, 38, 'allow'),
(84, 6, 'allow'),
(84, 39, 'allow'),
(84, 40, 'allow'),
(84, 7, 'allow'),
(84, 41, 'allow'),
(84, 42, 'allow'),
(84, 43, 'allow'),
(84, 46, 'allow'),
(84, 44, 'allow'),
(84, 45, 'allow'),
(84, 47, 'allow'),
(84, 0, 'allow');

-- --------------------------------------------------------

--
-- Table structure for table `who_we_are_sections`
--

CREATE TABLE `who_we_are_sections` (
  `id` int(11) NOT NULL,
  `section_type` varchar(100) NOT NULL COMMENT 'hero, section, features, voice, cta',
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `who_we_are_sections`
--

INSERT INTO `who_we_are_sections` (`id`, `section_type`, `title`, `subtitle`, `content`, `image_url`, `order_index`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'hero', 'We Are Ethiopian IT Park', 'The beating heart of Ethiopia\'s digital revolution — a world-class technology hub empowering innovation, entrepreneurship, and economic growth.', '<p><span style=\"background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);\">We are a&nbsp;</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(51, 51, 51);\">government-supported, future-driven ICT hub</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);\">&nbsp;located in Addis Ababa, designed to be the&nbsp;</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(51, 51, 51);\">digital backbone</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);\">&nbsp;of Ethiopia\'s transformation. At Ethiopian IT Park, we nurture the next generation of&nbsp;</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(51, 51, 51);\">tech leaders, startups, and investors</span><span style=\"background-color: rgb(255, 255, 255); color: rgb(102, 102, 102);\">&nbsp;who are shaping Africa\'s digital future.</span></p>', '', 0, 1, '2026-01-03 11:41:09', '2026-01-03 11:47:01'),
(2, 'section', 'Who We Are', '', '<p>We are a government-supported, future-driven ICT hub located in Addis Ababa, designed to be the digital backbone of Ethiopia\'s transformation. At Ethiopian IT Park, we nurture the next generation of tech leaders, startups, and investors who are shaping Africa\'s digital future.</p>', 'https://res.cloudinary.com/yesuf/image/upload/v1747135433/Incubation_euahej.png', 1, 1, '2026-01-03 11:41:09', '2026-01-14 12:09:01'),
(3, 'section', 'What We Stand For', NULL, '<ul><li><strong>Innovation</strong> – We foster creative solutions that solve real-world problems.</li><li><strong>Inclusion</strong> – We believe technology should empower all Ethiopians, everywhere.</li><li><strong>Collaboration</strong> – We bridge government, academia, industry, and investors.</li><li><strong>Impact</strong> – We aim to create jobs, attract investment, and scale digital capabilities.</li></ul>', '/images/home/stand-for.jpg', 2, 1, '2026-01-03 11:41:09', '2026-01-03 11:41:09'),
(4, 'features', 'What Makes Us Unique?', NULL, '[{\"title\": \"National-Level Initiative\", \"desc\": \"Backed by Ethiopia\'s digital transformation agenda\"}, {\"title\": \"Full-Scale Infrastructure\", \"desc\": \"Cloud, co-working, incubation, and enterprise zones\"}, {\"title\": \"Startup & SME Support\", \"desc\": \"Incubation, mentoring, and market access for local innovators\"}, {\"title\": \"Gateway to Africa\", \"desc\": \"Strategic hub for East Africa\'s growing tech market\"}, {\"title\": \"Investment Linkages\", \"desc\": \"Connecting global investors with high-potential African tech ventures\"}]', '/images/home/makes-unique.jpg', 3, 1, '2026-01-03 11:41:09', '2026-01-03 11:41:09'),
(5, 'section', 'Our Role in Digital Ecosystem', NULL, '<ul><li>Startups are born</li><li>Innovations thrive</li><li>Global partnerships begin</li><li>Jobs are created</li><li>Ideas become products</li></ul>', '/images/home/our-role.jpg', 4, 1, '2026-01-03 11:41:09', '2026-01-03 11:41:09'),
(6, 'voice', NULL, '\"We are here to lead Ethiopia\'s future with innovation, knowledge, and collaboration.\"', NULL, NULL, 5, 1, '2026-01-03 11:41:09', '2026-01-03 11:41:09');

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
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blocked_ips`
--
ALTER TABLE `blocked_ips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ip` (`ip_address`);

--
-- Indexes for table `board_members`
--
ALTER TABLE `board_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cms_menus`
--
ALTER TABLE `cms_menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_parent_menu` (`parent_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `news_item_id` (`news_item_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `generated_ids`
--
ALTER TABLE `generated_ids`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `id_card_persons`
--
ALTER TABLE `id_card_persons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_full_name` (`full_name`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `id_card_templates`
--
ALTER TABLE `id_card_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `investor_inquiries`
--
ALTER TABLE `investor_inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `revoked_tokens`
--
ALTER TABLE `revoked_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token` (`token`),
  ADD KEY `expires_at` (`expires_at`);

--
-- Indexes for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT for table `board_members`
--
ALTER TABLE `board_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `generated_ids`
--
ALTER TABLE `generated_ids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `id_card_persons`
--
ALTER TABLE `id_card_persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `id_card_templates`
--
ALTER TABLE `id_card_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `investor_inquiries`
--
ALTER TABLE `investor_inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `revoked_tokens`
--
ALTER TABLE `revoked_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
