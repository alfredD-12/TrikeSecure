-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 15, 2026 at 06:23 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trikesec`
--

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL,
  `tricycle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `complaint_type` varchar(100) DEFAULT NULL,
  `description` text,
  `date_reported` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','resolved') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int NOT NULL,
  `user_id` int NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `toda_name` varchar(100) DEFAULT NULL,
  `status` enum('active','suspended','expired') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `franchises`
--

CREATE TABLE `franchises` (
  `franchise_id` int NOT NULL,
  `tricycle_id` int NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `lgu_reference_no` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ride_requests`
--

CREATE TABLE `ride_requests` (
  `request_id` int NOT NULL,
  `commuter_id` int NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `dropoff_location` varchar(255) NOT NULL,
  `pickup_lat` decimal(10,8) DEFAULT NULL,
  `pickup_lng` decimal(11,8) DEFAULT NULL,
  `dropoff_lat` decimal(10,8) DEFAULT NULL,
  `dropoff_lng` decimal(11,8) DEFAULT NULL,
  `fare_amount` decimal(10,2) DEFAULT NULL,
  `request_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_driver_id` int DEFAULT NULL,
  `status` enum('waiting','accepted','completed','cancelled') DEFAULT 'waiting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sos_alerts`
--

CREATE TABLE `sos_alerts` (
  `alert_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_role` enum('commuter','driver') NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `ride_id` int DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','resolved') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sos_alerts`
--

INSERT INTO `sos_alerts` (`alert_id`, `user_id`, `user_role`, `latitude`, `longitude`, `ride_id`, `message`, `created_at`, `status`) VALUES
(1, 5, 'commuter', 13.98594536, 120.72705317, NULL, 'Emergency SOS activated', '2026-03-15 04:06:35', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `tricycles`
--

CREATE TABLE `tricycles` (
  `tricycle_id` int NOT NULL,
  `body_number` varchar(50) NOT NULL,
  `plate_number` varchar(50) DEFAULT NULL,
  `driver_id` int NOT NULL,
  `toda_name` varchar(100) DEFAULT NULL,
  `franchise_expiry` date DEFAULT NULL,
  `qr_code_value` varchar(255) NOT NULL,
  `status` enum('active','expired','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','officer','driver','commuter') NOT NULL,
  `status` enum('active','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`session_id`, `expires`, `data`) VALUES
('I5z_GVMypDVVM0I-WDRbAuJXejXqQJQV', 1773634684, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-03-16T04:18:03.826Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":5,\"username\":\"leyzvasquez\",\"fullName\":\"John Ley Lucky Vasquez\",\"email\":\"leyzvasquez@gmail.com\",\"role\":\"commuter\"}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `tricycle_id` (`tricycle_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `franchises`
--
ALTER TABLE `franchises`
  ADD PRIMARY KEY (`franchise_id`),
  ADD KEY `tricycle_id` (`tricycle_id`);

--
-- Indexes for table `ride_requests`
--
ALTER TABLE `ride_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `assigned_driver_id` (`assigned_driver_id`),
  ADD KEY `fk_ride_requests_commuter` (`commuter_id`),
  ADD KEY `idx_ride_requests_status` (`status`);

--
-- Indexes for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  ADD PRIMARY KEY (`alert_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tricycles`
--
ALTER TABLE `tricycles`
  ADD PRIMARY KEY (`tricycle_id`),
  ADD UNIQUE KEY `body_number` (`body_number`),
  ADD UNIQUE KEY `qr_code_value` (`qr_code_value`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `complaint_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `franchises`
--
ALTER TABLE `franchises`
  MODIFY `franchise_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ride_requests`
--
ALTER TABLE `ride_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  MODIFY `alert_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tricycles`
--
ALTER TABLE `tricycles`
  MODIFY `tricycle_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`),
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`);

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `franchises`
--
ALTER TABLE `franchises`
  ADD CONSTRAINT `franchises_ibfk_1` FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`) ON DELETE CASCADE;

--
-- Constraints for table `ride_requests`
--
ALTER TABLE `ride_requests`
  ADD CONSTRAINT `fk_ride_requests_commuter` FOREIGN KEY (`commuter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ride_requests_ibfk_1` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`driver_id`);

--
-- Constraints for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  ADD CONSTRAINT `sos_alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tricycles`
--
ALTER TABLE `tricycles`
  ADD CONSTRAINT `tricycles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
