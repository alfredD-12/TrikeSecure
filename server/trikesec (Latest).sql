-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 03, 2026 at 03:26 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

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
  `commuter_id` int DEFAULT NULL,
  `tricycle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `complaint_type` varchar(100) DEFAULT NULL,
  `description` text,
  `date_reported` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','resolved') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`complaint_id`, `commuter_id`, `tricycle_id`, `driver_id`, `complaint_type`, `description`, `date_reported`, `status`) VALUES
(6062, 2354, 7223, 8636, 'Vehicle cleanliness', 'Passenger reported vehicle cleanliness during evening trip.', '2025-09-02 10:00:57', 'pending'),
(6187, 8605, 9143, 4409, 'Wrong route', 'Passenger reported wrong route during evening trip.', '2025-06-23 06:57:42', 'resolved'),
(6192, 8637, 8119, 4677, 'Lost item', 'Passenger reported lost item during evening trip.', '2026-04-16 09:49:49', 'pending'),
(6197, 5536, 4920, 9160, 'Wrong route', 'Report needs validation from TODA and LGU desk.', '2026-02-22 12:37:58', 'pending'),
(6246, 1297, 8160, 3568, 'Excessive speed', 'Passenger reported excessive speed during evening trip.', '2025-09-02 16:36:23', 'resolved'),
(6281, 1297, 7577, 7312, 'Overcharging', 'Report needs validation from TODA and LGU desk.', '2025-06-04 20:55:09', 'resolved'),
(6309, 2531, 7088, 7083, 'Excessive speed', 'Passenger reported excessive speed during evening trip.', '2025-07-23 17:16:51', 'pending'),
(6340, 6616, 4423, 4178, 'No helmet', 'Passenger reported no helmet during evening trip.', '2025-05-19 14:46:19', 'resolved'),
(6480, 5100, 8790, 3170, 'Vehicle cleanliness', 'Incident logged near Bus Stop involving assigned tricycle.', '2025-07-09 02:24:30', 'resolved'),
(6668, 1297, 9883, 3605, 'Unsafe driving', 'Passenger reported unsafe driving during evening trip.', '2025-11-11 03:04:49', 'pending'),
(6913, 5536, 7554, 5369, 'Vehicle cleanliness', 'Commuter submitted concern about vehicle cleanliness for review.', '2025-10-17 14:11:37', 'resolved'),
(6926, 7527, 9116, 8860, 'Unsafe driving', 'Incident logged near Highway Terminal involving assigned tricycle.', '2025-10-18 22:34:07', 'resolved'),
(6927, 6616, 8354, 3869, 'Overcharging', 'Passenger reported overcharging during evening trip.', '2025-11-21 00:18:15', 'resolved'),
(6951, 8624, 9522, 9388, 'Excessive speed', 'Incident logged near College Entrance involving assigned tricycle.', '2025-12-13 19:03:53', 'pending'),
(6982, 1028, 6990, 5082, 'Vehicle cleanliness', 'Passenger reported vehicle cleanliness during evening trip.', '2025-11-20 14:36:31', 'resolved'),
(6984, 4034, 6096, 6747, 'Excessive speed', 'Report needs validation from TODA and LGU desk.', '2026-04-12 12:36:21', 'pending'),
(7043, 2882, 6165, 4494, 'Refused passenger', 'Incident logged near Town Park involving assigned tricycle.', '2026-03-11 22:33:58', 'pending'),
(7283, 9658, 8824, 8445, 'Rude behavior', 'Report needs validation from TODA and LGU desk.', '2026-04-24 01:22:12', 'pending'),
(7297, 9653, 8979, 8714, 'Unsafe driving', 'Passenger reported unsafe driving during evening trip.', '2026-02-07 18:46:53', 'resolved'),
(7428, 4457, 6677, 4989, 'Vehicle cleanliness', 'Report needs validation from TODA and LGU desk.', '2025-10-27 03:01:32', 'resolved'),
(7468, 8605, 6456, 5434, 'Overcharging', 'Commuter submitted concern about overcharging for review.', '2026-02-13 03:57:47', 'pending'),
(7481, 2882, 4033, 5578, 'Rude behavior', 'Incident logged near Town Park involving assigned tricycle.', '2025-11-15 16:25:01', 'resolved'),
(7525, 5100, 5088, 7790, 'Wrong route', 'Incident logged near Municipal Hall involving assigned tricycle.', '2026-01-31 16:03:18', 'pending'),
(7551, 5536, 7295, 8447, 'Excessive speed', 'Report needs validation from TODA and LGU desk.', '2026-01-19 18:35:29', 'resolved'),
(7613, 1445, 6085, 8782, 'Overcharging', 'Commuter submitted concern about overcharging for review.', '2025-08-13 09:21:11', 'pending'),
(7627, 5536, 8786, 4063, 'Excessive speed', 'Incident logged near Barangay Plaza involving assigned tricycle.', '2025-12-11 10:03:16', 'resolved'),
(7710, 6552, 7978, 8358, 'Unsafe driving', 'Commuter submitted concern about unsafe driving for review.', '2025-10-13 20:44:18', 'resolved'),
(7920, 8675, 6629, 4724, 'Refused passenger', 'Commuter submitted concern about refused passenger for review.', '2026-02-01 12:39:54', 'resolved'),
(7977, 2394, 5813, 6446, 'Vehicle cleanliness', 'Incident logged near Highway Terminal involving assigned tricycle.', '2025-12-17 20:16:59', 'pending'),
(8010, 7669, 8913, 7262, 'Unsafe driving', 'Incident logged near College Entrance involving assigned tricycle.', '2025-05-31 00:31:59', 'pending'),
(8121, 4034, 5048, 6218, 'Rude behavior', 'Report needs validation from TODA and LGU desk.', '2026-04-01 14:03:05', 'pending'),
(8152, 2882, 9177, 5737, 'Unsafe driving', 'Incident logged near Municipal Hall involving assigned tricycle.', '2025-05-19 13:12:43', 'pending'),
(8251, 8637, 5313, 8524, 'No helmet', 'Passenger reported no helmet during evening trip.', '2025-08-16 16:12:29', 'resolved'),
(8260, 8605, 7626, 9816, 'Vehicle cleanliness', 'Commuter submitted concern about vehicle cleanliness for review.', '2025-12-27 00:54:36', 'resolved'),
(8313, 9653, 9341, 9469, 'Lost item', 'Passenger reported lost item during evening trip.', '2025-12-13 17:48:54', 'pending'),
(8437, 1028, 7290, 5882, 'Excessive speed', 'Commuter submitted concern about excessive speed for review.', '2025-10-06 06:01:16', 'resolved'),
(8533, 4515, 9048, 3940, 'Excessive speed', 'Incident logged near Gas Station involving assigned tricycle.', '2025-06-10 02:09:39', 'resolved'),
(8535, 2394, 8792, 5477, 'Vehicle cleanliness', 'Incident logged near Town Park involving assigned tricycle.', '2026-01-26 17:43:51', 'pending'),
(8630, 5536, 7869, 4297, 'Overcharging', 'Report needs validation from TODA and LGU desk.', '2026-02-01 04:02:36', 'resolved'),
(8688, 2531, 6112, 4081, 'Vehicle cleanliness', 'Passenger reported vehicle cleanliness during evening trip.', '2025-12-21 01:50:55', 'pending'),
(8745, 1445, 9782, 9781, 'Excessive speed', 'Incident logged near Wet Market involving assigned tricycle.', '2026-02-17 21:10:37', 'pending'),
(8798, 7527, 8025, 5230, 'Excessive speed', 'Incident logged near Health Center involving assigned tricycle.', '2025-06-26 22:53:27', 'resolved'),
(8833, 5100, 9358, 6921, 'Wrong route', 'Report needs validation from TODA and LGU desk.', '2025-08-06 09:06:26', 'pending'),
(8907, 2913, 5202, 8158, 'Excessive speed', 'Report needs validation from TODA and LGU desk.', '2025-06-26 18:55:16', 'resolved'),
(9052, 9653, 6363, 4204, 'Rude behavior', 'Report needs validation from TODA and LGU desk.', '2026-04-19 18:08:13', 'resolved'),
(9253, 6552, 4525, 9641, 'Rude behavior', 'Incident logged near College Entrance involving assigned tricycle.', '2025-07-09 05:38:07', 'resolved'),
(9622, 2531, 5282, 3875, 'Excessive speed', 'Incident logged near Wet Market involving assigned tricycle.', '2025-07-09 11:35:32', 'pending'),
(9649, 9658, 5557, 9286, 'Overcharging', 'Commuter submitted concern about overcharging for review.', '2026-03-23 21:40:02', 'resolved'),
(9841, 2913, 5494, 5624, 'Unsafe driving', 'Passenger reported unsafe driving during evening trip.', '2025-11-27 09:45:15', 'pending'),
(9876, 2882, 7714, 3362, 'Wrong route', 'Passenger reported wrong route during evening trip.', '2025-07-08 10:43:06', 'resolved');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int NOT NULL,
  `user_id` int NOT NULL,
  `toda_id` int DEFAULT NULL,
  `membership_role` enum('president','member') NOT NULL DEFAULT 'member',
  `membership_status` enum('not_applied','pending','approved','rejected') NOT NULL DEFAULT 'not_applied',
  `license_number` varchar(50) NOT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `driver_license_document` varchar(255) DEFAULT NULL,
  `valid_id_document` varchar(255) DEFAULT NULL,
  `membership_applied_at` datetime DEFAULT NULL,
  `membership_reviewed_at` datetime DEFAULT NULL,
  `membership_reviewed_by_user_id` int DEFAULT NULL,
  `membership_remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `user_id`, `toda_id`, `membership_role`, `membership_status`, `license_number`, `license_expiry_date`, `contact_number`, `driver_license_document`, `valid_id_document`, `membership_applied_at`, `membership_reviewed_at`, `membership_reviewed_by_user_id`, `membership_remarks`, `created_at`, `updated_at`) VALUES
(3170, 9932, 2463, 'member', 'approved', 'N76-52-704031', '2030-02-07', '09194808552', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-10-07 04:31:54', '2025-10-10 07:31:54', 6743, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3362, 3658, 5535, 'president', 'approved', 'N75-54-185756', '2029-04-10', '09598974735', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-02-06 10:35:42', '2026-02-14 14:35:42', 3658, 'TODA president documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3568, 5351, 6555, 'member', 'approved', 'N65-83-850503', '2031-01-25', '09092253961', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-05-19 09:00:11', '2025-05-20 11:00:11', 9270, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3605, 2606, 9370, 'president', 'approved', 'N82-72-403330', '2028-10-04', '09758165184', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-05-23 19:06:29', '2025-06-01 05:06:29', 2606, 'President profile verified.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3869, 4668, 3357, 'president', 'approved', 'N08-75-358051', '2029-10-27', '09422708505', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-04-15 03:05:11', '2025-04-17 04:05:11', 4668, 'TODA president documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3875, 6743, 2463, 'president', 'approved', 'N93-26-490954', '2029-04-17', '09030205282', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-14 02:11:26', '2025-09-19 03:11:26', 6743, 'President profile verified.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3940, 5843, 9370, 'member', 'approved', 'N55-61-182792', '2030-12-27', '09768036625', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-02-01 09:47:02', '2026-02-12 13:47:02', 2606, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4063, 1228, 6794, 'member', 'approved', 'N85-32-576446', '2028-03-29', '09502720766', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-02-12 05:22:32', '2026-02-24 13:22:32', 3089, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4081, 3824, 8601, 'member', 'approved', 'N58-91-240757', '2028-04-20', '09952503729', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-22 07:03:23', '2025-09-26 09:03:23', 5152, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4178, 9918, 6794, 'member', 'approved', 'N41-69-122976', '2028-10-23', '09644170972', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-26 14:48:29', '2025-10-06 22:48:29', 3089, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4204, 1757, 6555, 'member', 'approved', 'N61-51-561414', '2029-01-01', '09193679387', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-03-04 02:19:19', '2025-03-09 08:19:19', 9270, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4297, 7326, 9370, 'member', 'approved', 'N59-23-172612', '2027-12-18', '09304585790', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-07-23 20:49:15', '2025-08-02 06:49:15', 2606, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4409, 4743, 6543, 'member', 'approved', 'N09-67-724516', '2030-06-03', '09106045498', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-12-24 17:43:58', '2025-12-30 21:43:58', 2064, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4494, 4635, 7951, 'president', 'approved', 'N40-51-750195', '2028-07-16', '09515878606', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-01-17 17:30:59', '2026-01-22 00:30:59', 4635, 'President profile verified.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4677, 9364, 7951, 'member', 'approved', 'N75-67-936123', '2029-11-23', '09536424118', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-10-05 09:32:46', '2025-10-09 17:32:46', 4635, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4724, 4346, 7951, 'member', 'approved', 'N46-99-444478', '2027-05-14', '09424225886', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-05-02 18:26:54', '2025-05-13 04:26:54', 4635, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4989, 2064, 6543, 'president', 'approved', 'N14-40-595855', '2027-02-02', '09102565391', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-11 18:51:32', '2025-09-17 03:51:32', 2064, 'President profile verified.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5082, 7362, 3357, 'member', 'approved', 'N57-29-814702', '2029-02-02', '09176017235', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-11-02 23:58:15', '2025-11-13 04:58:15', 4668, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5230, 4833, 2463, 'member', 'approved', 'N07-74-457215', '2028-10-24', '09998252919', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-08-04 07:38:15', '2025-08-08 14:38:15', 6743, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5369, 1538, 2564, 'president', 'approved', 'N19-45-118328', '2028-12-18', '09957519565', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-02-17 04:43:43', '2025-02-18 08:43:43', 1538, 'Founder membership approved.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5434, 6791, 3357, 'member', 'approved', 'N20-53-396685', '2030-01-08', '09327654854', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-02-04 14:38:40', '2025-02-08 19:38:40', 4668, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5477, 1240, 9370, 'member', 'approved', 'N07-40-606922', '2029-02-20', '09072110262', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-04-06 02:33:25', '2025-04-08 10:33:25', 2606, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5578, 8877, 8601, 'member', 'approved', 'N13-59-709356', '2030-09-23', '09994508435', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-11-17 00:52:02', '2025-11-29 02:52:02', 5152, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5624, 3834, 2564, 'member', 'approved', 'N76-14-013004', '2030-10-31', '09027182461', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-05-02 16:41:45', '2025-05-12 19:41:45', 1538, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5737, 1242, 8601, 'member', 'approved', 'N34-01-534618', '2030-07-19', '09264667954', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-12-24 01:37:34', '2025-12-28 03:37:34', 5152, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5882, 7421, 6437, 'member', 'approved', 'N17-56-766659', '2029-08-04', '09238111554', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-02 20:11:10', '2025-09-03 22:11:10', 4191, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6218, 5292, 2822, 'member', 'approved', 'N59-77-011210', '2031-06-20', '09630009254', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-02-15 18:17:43', '2026-02-25 00:17:43', 8208, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6446, 1146, 2564, 'member', 'approved', 'N85-05-992216', '2030-07-04', '09131963583', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-23 18:59:01', '2025-10-05 03:59:01', 1538, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6747, 1734, 6543, 'member', 'approved', 'N89-25-524627', '2030-04-18', '09888886662', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-03-19 07:48:01', '2025-03-27 17:48:01', 2064, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6921, 8208, 2822, 'president', 'approved', 'N51-31-542463', '2029-06-25', '09847897624', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-02-22 04:50:16', '2025-02-23 12:50:16', 8208, 'Founder membership approved.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7083, 7792, 6543, 'member', 'approved', 'N99-97-818360', '2031-07-03', '09161187085', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-07-24 12:14:23', '2025-07-29 15:14:23', 2064, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7262, 2248, 8601, 'member', 'approved', 'N88-76-515231', '2030-11-11', '09770750354', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-08-02 14:23:47', '2025-08-04 19:23:47', 5152, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7312, 5152, 8601, 'president', 'approved', 'N00-68-328482', '2028-02-03', '09199921288', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-04-05 09:11:52', '2025-04-13 10:11:52', 5152, 'Founder membership approved.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7790, 4836, 9370, 'member', 'approved', 'N77-76-167547', '2028-02-21', '09048228478', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-01-04 05:30:10', '2026-01-10 11:30:10', 2606, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8158, 8904, 2564, 'member', 'approved', 'N73-69-721097', '2031-05-05', '09645764830', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-06-04 13:42:41', '2025-06-15 19:42:41', 1538, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8358, 4191, 6437, 'president', 'approved', 'N65-37-978497', '2027-01-11', '09363830797', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-03-17 01:24:29', '2025-03-18 09:24:29', 4191, 'TODA president documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8445, 6908, 2463, 'member', 'approved', 'N56-15-240146', '2027-02-02', '09085971430', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-03-11 22:53:19', '2025-03-21 03:53:19', 6743, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8447, 6929, 2822, 'member', 'approved', 'N32-65-191982', '2030-08-01', '09363257434', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-12 06:50:08', '2025-09-17 13:50:08', 8208, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8524, 1717, 6555, 'member', 'approved', 'N80-94-427049', '2027-11-09', '09876768111', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-06-24 15:47:41', '2025-06-26 19:47:41', 9270, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8636, 6799, 3357, 'member', 'approved', 'N14-30-862459', '2031-10-28', '09487961736', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-10-12 04:38:54', '2025-10-20 05:38:54', 4668, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8714, 3089, 6794, 'president', 'approved', 'N03-90-028221', '2030-12-22', '09806056452', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-01-13 20:28:35', '2026-01-19 00:28:35', 3089, 'Founder membership approved.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8782, 4796, 6543, 'member', 'approved', 'N26-81-334969', '2030-01-14', '09785568333', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-02-09 05:24:24', '2025-02-13 11:24:24', 2064, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8860, 9270, 6555, 'president', 'approved', 'N33-89-346793', '2027-02-14', '09043385284', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-09-18 06:08:08', '2025-09-21 07:08:08', 9270, 'Founder membership approved.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9160, 6299, 5535, 'member', 'approved', 'N99-09-467461', '2028-10-13', '09240165338', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-02-28 14:42:35', '2026-03-02 22:42:35', 3658, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9286, 2711, 8601, 'member', 'approved', 'N70-03-329631', '2031-09-17', '09427127429', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2026-01-24 18:11:11', '2026-02-04 03:11:11', 5152, 'Approved by TODA president.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9388, 1140, 2463, 'member', 'approved', 'N64-87-186351', '2029-01-03', '09293245271', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-06-12 10:12:29', '2025-06-22 20:12:29', 6743, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9469, 8956, 9370, 'member', 'approved', 'N30-18-189860', '2029-04-15', '09651929600', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-11-10 18:04:34', '2025-11-13 20:04:34', 2606, 'Membership documents validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9641, 4703, 6437, 'member', 'approved', 'N76-15-445839', '2027-12-14', '09557001646', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-11-11 00:22:10', '2025-11-18 05:22:10', 4191, 'License and valid ID checked.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9781, 1661, 6794, 'member', 'approved', 'N25-39-351793', '2028-01-26', '09220840467', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-04-23 17:18:08', '2025-05-03 02:18:08', 3089, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9816, 1730, 2463, 'member', 'approved', 'N12-23-470912', '2028-01-11', '09299130706', '/uploads/driver-documents/1775185603629-5e1c571f-ed02-43fa-a8bf-ad44165fde38.jpg', '/uploads/driver-documents/1775185603634-b8dab993-dd71-49a0-8d0a-1cdf31ae0421.jpg', '2025-12-17 01:52:46', '2025-12-20 05:52:46', 6743, 'Accepted under assigned TODA.', '2026-05-03 15:23:22', '2026-05-03 15:23:22');

--
-- Triggers `drivers`
--
DELIMITER $$
CREATE TRIGGER `trg_drivers_before_insert` BEFORE INSERT ON `drivers` FOR EACH ROW BEGIN
  DECLARE account_role VARCHAR(20);
  DECLARE toda_status VARCHAR(20);
  DECLARE toda_president_user_id INT;

  SELECT `role` INTO account_role
  FROM `users`
  WHERE `user_id` = NEW.`user_id`
  LIMIT 1;

  IF account_role IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected driver account does not exist.';
  END IF;

  IF account_role <> 'driver' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only users with role driver can have a driver profile.';
  END IF;

  IF NEW.`membership_status` IN ('pending','approved','rejected') THEN
    IF NEW.`toda_id` IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A TODA must be selected before membership can be processed.';
    END IF;

    IF NEW.`driver_license_document` IS NULL OR TRIM(NEW.`driver_license_document`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Driver membership requires a driver license document.';
    END IF;

    IF NEW.`valid_id_document` IS NULL OR TRIM(NEW.`valid_id_document`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Driver membership requires a valid ID document.';
    END IF;

    IF NEW.`membership_applied_at` IS NULL THEN
      SET NEW.`membership_applied_at` = CURRENT_TIMESTAMP;
    END IF;
  END IF;

  IF NEW.`toda_id` IS NOT NULL THEN
    SELECT `status`, `president_user_id`
      INTO toda_status, toda_president_user_id
    FROM `todas`
    WHERE `toda_id` = NEW.`toda_id`
    LIMIT 1;

    IF toda_status IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected TODA does not exist.';
    END IF;

    IF toda_status <> 'approved' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only approved TODAs can accept members.';
    END IF;

    IF NEW.`membership_role` = 'president' AND toda_president_user_id <> NEW.`user_id` THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The president membership must match the registered TODA president account.';
    END IF;
  END IF;

  IF NEW.`membership_status` = 'approved' AND NEW.`membership_reviewed_at` IS NULL THEN
    SET NEW.`membership_reviewed_at` = CURRENT_TIMESTAMP;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_drivers_before_update` BEFORE UPDATE ON `drivers` FOR EACH ROW BEGIN
  DECLARE account_role VARCHAR(20);
  DECLARE toda_status VARCHAR(20);
  DECLARE toda_president_user_id INT;

  SELECT `role` INTO account_role
  FROM `users`
  WHERE `user_id` = NEW.`user_id`
  LIMIT 1;

  IF account_role IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected driver account does not exist.';
  END IF;

  IF account_role <> 'driver' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only users with role driver can have a driver profile.';
  END IF;

  IF NEW.`membership_status` IN ('pending','approved','rejected') THEN
    IF NEW.`toda_id` IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A TODA must be selected before membership can be processed.';
    END IF;

    IF NEW.`driver_license_document` IS NULL OR TRIM(NEW.`driver_license_document`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Driver membership requires a driver license document.';
    END IF;

    IF NEW.`valid_id_document` IS NULL OR TRIM(NEW.`valid_id_document`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Driver membership requires a valid ID document.';
    END IF;

    IF NEW.`membership_applied_at` IS NULL THEN
      SET NEW.`membership_applied_at` = CURRENT_TIMESTAMP;
    END IF;
  END IF;

  IF NEW.`toda_id` IS NOT NULL THEN
    SELECT `status`, `president_user_id`
      INTO toda_status, toda_president_user_id
    FROM `todas`
    WHERE `toda_id` = NEW.`toda_id`
    LIMIT 1;

    IF toda_status IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected TODA does not exist.';
    END IF;

    IF toda_status <> 'approved' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only approved TODAs can accept members.';
    END IF;

    IF NEW.`membership_role` = 'president' AND toda_president_user_id <> NEW.`user_id` THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The president membership must match the registered TODA president account.';
    END IF;
  END IF;

  IF NEW.`membership_status` = 'approved' AND NEW.`membership_reviewed_at` IS NULL THEN
    SET NEW.`membership_reviewed_at` = CURRENT_TIMESTAMP;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `franchises`
--

CREATE TABLE `franchises` (
  `franchise_id` int NOT NULL,
  `tricycle_id` int NOT NULL,
  `status` enum('pending','approved','rejected','expired','revoked') NOT NULL DEFAULT 'pending',
  `toda_certificate_document` varchar(255) NOT NULL,
  `or_cr_document` varchar(255) NOT NULL,
  `insurance_document` varchar(255) NOT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `lgu_reference_no` varchar(100) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_user_id` int DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `franchises`
--

INSERT INTO `franchises` (`franchise_id`, `tricycle_id`, `status`, `toda_certificate_document`, `or_cr_document`, `insurance_document`, `issue_date`, `expiry_date`, `lgu_reference_no`, `reviewed_at`, `reviewed_by_user_id`, `remarks`, `created_at`, `updated_at`) VALUES
(5074, 6096, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-06-29', '2027-06-29', 'LGU-HITG-35179', '2025-07-01 10:34:00', 2981, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5227, 8160, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-01-01', '2027-01-01', 'LGU-W09W-66928', '2025-01-02 13:14:00', 8578, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5336, 8790, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-01-09', '2027-01-09', 'LGU-4QOC-36940', '2026-01-13 11:40:00', 1510, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5353, 5088, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-09-14', '2026-09-14', 'LGU-58P9-99433', '2025-09-19 08:15:00', 2981, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5378, 7554, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-02-05', '2029-02-04', 'LGU-1SIQ-52822', '2026-02-08 16:46:00', 3599, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5447, 5048, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-22', '2027-11-22', 'LGU-QF14-58849', '2025-11-23 10:47:00', 4090, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5448, 4033, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-04-17', '2027-04-17', 'LGU-838R-15652', '2025-04-18 09:42:00', 1510, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5464, 8786, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-06-30', '2028-06-29', 'LGU-S2CZ-37750', '2025-07-01 11:08:00', 1510, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5599, 8792, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-02-26', '2027-02-26', 'LGU-PSC0-93601', '2025-03-02 13:17:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5657, 8354, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-20', '2027-03-20', 'LGU-HCJS-82566', '2025-03-22 10:18:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5793, 5282, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-04', '2027-11-04', 'LGU-DC1S-66947', '2025-11-08 12:59:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5821, 7869, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-02-21', '2027-02-21', 'LGU-NLPC-12057', '2026-02-25 13:50:00', 8578, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6060, 5813, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-15', '2028-07-14', 'LGU-A8W4-59110', '2025-07-18 11:00:00', 1510, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6124, 6112, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-01-18', '2027-01-18', 'LGU-R8XJ-89502', '2025-01-22 15:38:00', 4090, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6472, 6085, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-06-30', '2028-06-29', 'LGU-GF28-11338', '2025-07-05 11:44:00', 1510, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6575, 9782, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-12', '2028-11-11', 'LGU-8P6W-87298', '2025-11-13 08:40:00', 1510, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6599, 5313, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-10-24', '2028-10-23', 'LGU-9839-80159', '2025-10-29 13:21:00', 3032, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6606, 7626, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-02-19', '2028-02-19', 'LGU-G3UW-54608', '2026-02-23 09:23:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6626, 6363, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-03-12', '2029-03-11', 'LGU-8Q9X-85953', '2026-03-17 09:01:00', 3032, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6715, 4920, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-01-03', '2027-01-03', 'LGU-94AQ-92139', '2025-01-07 10:21:00', 2981, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6796, 8979, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-07', '2027-07-07', 'LGU-0QSQ-52667', '2025-07-10 09:17:00', 1510, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6839, 8119, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-10-16', '2027-10-16', 'LGU-ZEK6-43850', '2025-10-19 16:05:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6885, 8025, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-14', '2028-03-13', 'LGU-5UH5-33105', '2025-03-18 11:56:00', 3032, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7306, 9358, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-09', '2026-03-09', 'LGU-STVL-64493', '2025-03-10 16:52:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7383, 5202, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-01-07', '2028-01-07', 'LGU-3OWZ-79714', '2025-01-11 16:30:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7520, 9177, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-18', '2028-07-17', 'LGU-OQVD-30170', '2025-07-20 12:07:00', 4090, 'LGU franchise number assigned.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7581, 7714, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-06', '2027-07-06', 'LGU-9X41-23454', '2025-07-10 15:58:00', 3032, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7664, 9341, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-10-05', '2026-10-05', 'LGU-YQIT-45410', '2025-10-08 13:26:00', 4090, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7718, 7088, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-12-19', '2027-12-19', 'LGU-C7CX-79608', '2025-12-24 13:14:00', 3032, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7820, 6677, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-08-31', '2027-08-31', 'LGU-CY2V-89906', '2025-09-05 09:50:00', 3032, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7865, 5557, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-03', '2027-03-03', 'LGU-RYKQ-92584', '2025-03-07 08:47:00', 8578, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7917, 6629, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-08', '2028-03-07', 'LGU-OUAO-17071', '2025-03-10 08:33:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8217, 9116, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-08-15', '2028-08-14', 'LGU-B4FK-20240', '2025-08-16 09:51:00', 3032, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8755, 6456, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-04-10', '2028-04-09', 'LGU-P6G7-96758', '2026-04-15 16:15:00', 3032, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8783, 6990, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-03-21', '2028-03-20', 'LGU-YAPO-89746', '2025-03-23 10:18:00', 1510, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8908, 4423, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-01-18', '2029-01-17', 'LGU-YIKY-61040', '2026-01-23 14:17:00', 4090, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8996, 4525, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-25', '2028-07-24', 'LGU-JAYI-90337', '2025-07-27 14:14:00', 8578, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9055, 9048, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-06-09', '2028-06-08', 'LGU-845W-43178', '2025-06-10 13:20:00', 8578, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9070, 5494, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-27', '2027-07-27', 'LGU-KS2V-98778', '2025-07-30 09:36:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9107, 7577, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-05-21', '2027-05-21', 'LGU-3H49-54602', '2025-05-25 13:49:00', 2981, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9384, 9522, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-02-26', '2028-02-26', 'LGU-B32X-19646', '2026-03-01 15:51:00', 3599, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9395, 7223, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-21', '2027-07-21', 'LGU-KCU0-88813', '2025-07-25 14:47:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9506, 7978, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-02-07', '2028-02-07', 'LGU-QV6S-53624', '2025-02-10 14:05:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9520, 9143, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-01', '2028-10-31', 'LGU-9165-22503', '2025-11-04 13:44:00', 3599, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9584, 7290, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-07-22', '2026-07-22', 'LGU-3S90-78754', '2025-07-26 16:58:00', 1510, 'Approved after OR/CR verification.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9619, 9883, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-04', '2028-11-03', 'LGU-9HTG-34031', '2025-11-09 09:53:00', 1510, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9682, 8913, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-09-30', '2027-09-30', 'LGU-59DY-36070', '2025-10-04 09:57:00', 2981, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9707, 8824, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-11-19', '2028-11-18', 'LGU-0QHW-19931', '2025-11-22 14:57:00', 8578, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9719, 7295, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2026-03-23', '2027-03-23', 'LGU-TXQT-40601', '2026-03-24 08:32:00', 8578, 'Franchise approved after compliance review.', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9747, 6165, 'approved', '/uploads/driver-documents/1777781470547-8c51fb54-bbe1-4b88-96de-6dec2abf972a.pdf', '/uploads/driver-documents/1777781470550-d0d23965-bc55-4cc1-a7be-f3e9d545177f.pdf', '/uploads/driver-documents/1777781470553-712490f7-d2b7-4782-b9a0-b4ae9461076c.pdf', '2025-04-08', '2027-04-08', 'LGU-HPCM-44909', '2025-04-12 08:02:00', 1510, 'Insurance and TODA certificate validated.', '2026-05-03 15:23:22', '2026-05-03 15:23:22');

--
-- Triggers `franchises`
--
DELIMITER $$
CREATE TRIGGER `trg_franchises_after_insert` AFTER INSERT ON `franchises` FOR EACH ROW BEGIN
  IF NEW.`status` = 'approved' THEN
    UPDATE `tricycles`
    SET `status` = 'approved',
        `franchise_expiry` = NEW.`expiry_date`
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSEIF NEW.`status` = 'rejected' THEN
    UPDATE `tricycles`
    SET `status` = 'rejected',
        `franchise_expiry` = NULL
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSE
    UPDATE `tricycles`
    SET `status` = 'pending'
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_franchises_after_update` AFTER UPDATE ON `franchises` FOR EACH ROW BEGIN
  IF NEW.`status` = 'approved' THEN
    UPDATE `tricycles`
    SET `status` = 'approved',
        `franchise_expiry` = NEW.`expiry_date`
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSEIF NEW.`status` = 'rejected' THEN
    UPDATE `tricycles`
    SET `status` = 'rejected',
        `franchise_expiry` = NULL
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSEIF NEW.`status` = 'expired' THEN
    UPDATE `tricycles`
    SET `status` = 'expired',
        `franchise_expiry` = NEW.`expiry_date`
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSEIF NEW.`status` = 'revoked' THEN
    UPDATE `tricycles`
    SET `status` = 'suspended',
        `franchise_expiry` = NULL
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  ELSE
    UPDATE `tricycles`
    SET `status` = 'pending'
    WHERE `tricycle_id` = NEW.`tricycle_id`;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_franchises_before_insert` BEFORE INSERT ON `franchises` FOR EACH ROW BEGIN
  DECLARE linked_driver_id INT;
  DECLARE driver_membership_status VARCHAR(20);
  DECLARE reviewer_role VARCHAR(20);

  SELECT `driver_id`
    INTO linked_driver_id
  FROM `tricycles`
  WHERE `tricycle_id` = NEW.`tricycle_id`
  LIMIT 1;

  IF linked_driver_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected tricycle does not exist.';
  END IF;

  SELECT `membership_status`
    INTO driver_membership_status
  FROM `drivers`
  WHERE `driver_id` = linked_driver_id
  LIMIT 1;

  IF driver_membership_status <> 'approved' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only approved TODA members can apply for a franchise.';
  END IF;

  IF NEW.`reviewed_by_user_id` IS NOT NULL THEN
    SELECT `role`
      INTO reviewer_role
    FROM `users`
    WHERE `user_id` = NEW.`reviewed_by_user_id`
    LIMIT 1;

    IF reviewer_role IS NULL OR reviewer_role <> 'lgu' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only an LGU account can review a franchise application.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_by_user_id` IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A reviewed franchise application must have an LGU reviewer.';
  END IF;

  IF NEW.`status` = 'approved' THEN
    IF NEW.`issue_date` IS NULL OR NEW.`expiry_date` IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'An approved franchise must have issue and expiry dates.';
    END IF;

    IF NEW.`expiry_date` <= NEW.`issue_date` THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Franchise expiry must be later than the issue date.';
    END IF;

    IF NEW.`lgu_reference_no` IS NULL OR TRIM(NEW.`lgu_reference_no`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'An approved franchise must have an LGU reference number.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_at` IS NULL THEN
    SET NEW.`reviewed_at` = CURRENT_TIMESTAMP;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_franchises_before_update` BEFORE UPDATE ON `franchises` FOR EACH ROW BEGIN
  DECLARE linked_driver_id INT;
  DECLARE driver_membership_status VARCHAR(20);
  DECLARE reviewer_role VARCHAR(20);

  SELECT `driver_id`
    INTO linked_driver_id
  FROM `tricycles`
  WHERE `tricycle_id` = NEW.`tricycle_id`
  LIMIT 1;

  IF linked_driver_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected tricycle does not exist.';
  END IF;

  SELECT `membership_status`
    INTO driver_membership_status
  FROM `drivers`
  WHERE `driver_id` = linked_driver_id
  LIMIT 1;

  IF driver_membership_status <> 'approved' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only approved TODA members can keep a franchise application.';
  END IF;

  IF NEW.`reviewed_by_user_id` IS NOT NULL THEN
    SELECT `role`
      INTO reviewer_role
    FROM `users`
    WHERE `user_id` = NEW.`reviewed_by_user_id`
    LIMIT 1;

    IF reviewer_role IS NULL OR reviewer_role <> 'lgu' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only an LGU account can review a franchise application.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_by_user_id` IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A reviewed franchise application must have an LGU reviewer.';
  END IF;

  IF NEW.`status` = 'approved' THEN
    IF NEW.`issue_date` IS NULL OR NEW.`expiry_date` IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'An approved franchise must have issue and expiry dates.';
    END IF;

    IF NEW.`expiry_date` <= NEW.`issue_date` THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Franchise expiry must be later than the issue date.';
    END IF;

    IF NEW.`lgu_reference_no` IS NULL OR TRIM(NEW.`lgu_reference_no`) = '' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'An approved franchise must have an LGU reference number.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_at` IS NULL THEN
    SET NEW.`reviewed_at` = CURRENT_TIMESTAMP;
  END IF;
END
$$
DELIMITER ;

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
  `accepted_at` timestamp NULL DEFAULT NULL,
  `arrived_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `assigned_driver_id` int DEFAULT NULL,
  `status` enum('waiting','accepted','arrived','in_progress','completed','cancelled') DEFAULT 'waiting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ride_requests`
--

INSERT INTO `ride_requests` (`request_id`, `commuter_id`, `pickup_location`, `dropoff_location`, `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `fare_amount`, `request_time`, `accepted_at`, `arrived_at`, `started_at`, `completed_at`, `cancelled_at`, `assigned_driver_id`, `status`) VALUES
(7014, 7527, 'Highway Terminal, Maligaya', 'Covered Court, Rosario', 14.15750498, 121.09751106, 14.16200798, 121.11175302, 105.38, '2025-09-27 11:13:13', '2025-09-27 11:14:13', '2025-09-27 11:26:13', '2025-09-27 11:28:13', '2025-09-27 11:55:13', NULL, 5737, 'completed'),
(7021, 7041, 'Town Park, San Roque', 'City Mall, Cuenca', 14.13943315, 121.20275524, 14.16730642, 121.19952222, 92.05, '2025-08-30 08:08:45', '2025-08-30 08:11:45', '2025-08-30 08:16:45', '2025-08-30 08:19:45', '2025-08-30 08:27:45', NULL, 7790, 'completed'),
(7061, 1028, 'Gas Station, Pansol', 'Barangay Hall, Padre Garcia', 14.08767357, 121.22241825, 14.09290213, 121.23317538, 145.93, '2026-03-17 05:29:48', '2026-03-17 05:32:48', '2026-03-17 05:40:48', '2026-03-17 05:46:48', '2026-03-17 06:19:48', NULL, 3875, 'completed'),
(7201, 8624, 'Public Market, San Isidro', 'Covered Court, Lipa City', 14.10128969, 121.08584672, 14.08283916, 121.08789757, 70.77, '2026-02-24 21:56:47', '2026-02-24 22:03:47', '2026-02-24 22:07:47', '2026-02-24 22:13:47', '2026-02-24 22:30:47', NULL, 9781, 'completed'),
(7208, 9658, 'Bus Stop, Poblacion', 'Farm Road, Padre Garcia', 14.06920059, 121.02846479, 14.07276476, 121.02341029, 80.35, '2025-09-06 16:09:09', '2025-09-06 16:10:09', '2025-09-06 16:15:09', '2025-09-06 16:19:09', '2025-09-06 16:45:09', NULL, 5434, 'completed'),
(7407, 7041, 'Highway Terminal, Balagtas', 'Transport Terminal, Rosario', 14.23459319, 121.16205431, 14.24062929, 121.17402907, 180.09, '2026-04-12 06:14:53', '2026-04-12 06:15:53', '2026-04-12 06:25:53', '2026-04-12 06:31:53', '2026-04-12 06:55:53', NULL, 3568, 'completed'),
(7457, 9122, 'Bus Stop, Mabini', 'Warehouse, Rosario', 14.17097865, 121.03119223, 14.16343780, 121.03597994, 236.54, '2025-08-02 14:22:53', '2025-08-02 14:23:53', '2025-08-02 14:32:53', '2025-08-02 14:37:53', '2025-08-02 15:06:53', NULL, 9388, 'completed'),
(7473, 9653, 'Elementary School, Mabini', 'Farm Road, Padre Garcia', 14.12903872, 121.03994925, 14.12952996, 121.06364323, 97.57, '2026-03-18 13:45:02', '2026-03-18 13:49:02', '2026-03-18 13:57:02', '2026-03-18 14:01:02', '2026-03-18 14:33:02', NULL, 9286, 'completed'),
(7545, 4457, 'Health Center, Malvar', 'Medical Clinic, Padre Garcia', 14.00864219, 121.01788976, 14.03581257, 121.00855048, 110.14, '2025-08-28 15:52:59', '2025-08-28 15:53:59', '2025-08-28 15:58:59', '2025-08-28 15:59:59', '2025-08-28 16:27:59', NULL, 9469, 'completed'),
(7648, 4034, 'Town Park, Mabini', 'Hardware Store, Tanauan City', 14.07440067, 121.21076464, 14.06747673, 121.19681817, 103.23, '2025-09-29 22:50:37', '2025-09-29 22:51:37', '2025-09-29 22:57:37', '2025-09-29 23:01:37', '2025-09-29 23:21:37', NULL, 3940, 'completed'),
(7694, 2354, 'Barangay Plaza, Balele', 'Hardware Store, Cuenca', 14.17582346, 121.19949779, 14.17403133, 121.17285230, 87.13, '2025-10-24 17:30:46', '2025-10-24 17:31:46', '2025-10-24 17:39:46', '2025-10-24 17:44:46', '2025-10-24 18:20:46', NULL, 3605, 'completed'),
(7748, 7063, 'College Entrance, Calumpang', 'Transport Terminal, Malvar', 14.06070630, 121.04939012, 14.06274927, 121.06728363, 248.06, '2026-02-21 23:04:32', '2026-02-21 23:10:32', '2026-02-21 23:16:32', '2026-02-21 23:20:32', '2026-02-21 23:38:32', NULL, 4178, 'completed'),
(7753, 5536, 'College Entrance, Payapa', 'Senior High School, Sto. Tomas', 14.22577621, 121.24184084, 14.22917651, 121.22921787, 67.06, '2025-11-23 00:17:17', '2025-11-23 00:20:17', '2025-11-23 00:23:17', '2025-11-23 00:29:17', '2025-11-23 00:46:17', NULL, 5082, 'completed'),
(7784, 6616, 'Rice Mill, Sta. Cruz', 'Senior High School, Tanauan City', 14.16884467, 121.05401905, 14.17493101, 121.07956490, 201.57, '2026-03-15 04:51:15', '2026-03-15 04:52:15', '2026-03-15 04:59:15', '2026-03-15 05:03:15', '2026-03-15 05:33:15', NULL, 4204, 'completed'),
(7808, 6966, 'Elementary School, San Jose', 'Medical Clinic, Balete', 14.17038658, 121.07536032, 14.19193212, 121.06174357, 149.39, '2025-12-20 15:52:27', '2025-12-20 15:53:27', '2025-12-20 16:05:27', '2025-12-20 16:07:27', '2025-12-20 16:27:27', NULL, 5369, 'completed'),
(7833, 8637, 'Cooperative Office, Poblacion', 'Hardware Store, Balete', 14.03012485, 121.00782706, 14.00313957, 120.98716216, 230.34, '2025-10-04 18:08:41', '2025-10-04 18:15:41', '2025-10-04 18:19:41', '2025-10-04 18:25:41', '2025-10-04 18:51:41', NULL, 9641, 'completed'),
(7842, 6552, 'Bus Stop, Banaybanay', 'City Mall, San Jose', 14.11507738, 121.23166419, 14.09338877, 121.21358563, 255.03, '2025-09-05 16:17:31', '2025-09-05 16:22:31', '2025-09-05 16:31:31', '2025-09-05 16:37:31', '2025-09-05 16:47:31', NULL, 6446, 'completed'),
(7870, 4515, 'Health Center, Tambo', 'Medical Clinic, Cuenca', 14.07928849, 121.06378048, 14.10254550, 121.09139350, 127.17, '2026-03-19 23:45:41', '2026-03-19 23:51:41', '2026-03-19 23:57:41', '2026-03-20 00:03:41', '2026-03-20 00:36:41', NULL, 8524, 'completed'),
(8049, 4034, 'Wet Market, Bagong Silang', 'Junction, Cuenca', 14.04894354, 121.16643207, 14.07048400, 121.18233015, 54.38, '2025-12-02 08:53:55', '2025-12-02 08:57:55', '2025-12-02 09:08:55', '2025-12-02 09:10:55', '2025-12-02 09:40:55', NULL, 4081, 'completed'),
(8140, 8675, 'Elementary School, Payapa', 'Public Cemetery, Cuenca', 14.16416144, 121.07110172, 14.18417821, 121.06257552, 168.51, '2025-08-12 21:25:23', '2025-08-12 21:31:23', '2025-08-12 21:35:23', '2025-08-12 21:37:23', '2025-08-12 22:13:23', NULL, 6747, 'completed'),
(8179, 5100, 'Bus Stop, Dila', 'Police Station, Tanauan City', 14.13366561, 121.04069248, 14.15878689, 121.04402365, 79.46, '2025-08-17 06:41:05', '2025-08-17 06:43:05', '2025-08-17 06:55:05', '2025-08-17 06:58:05', '2025-08-17 07:17:05', NULL, 8445, 'completed'),
(8206, 6552, 'Rice Mill, Sampaguita', 'Farm Road, Balete', 14.07213887, 121.04446203, 14.08423476, 121.01552859, 148.27, '2025-10-01 20:15:14', '2025-10-01 20:22:14', '2025-10-01 20:28:14', '2025-10-01 20:34:14', '2025-10-01 20:56:14', NULL, 7312, 'completed'),
(8252, 1028, 'Gas Station, Pansol', 'Covered Court, Malvar', 14.01406958, 121.10975195, 13.99637458, 121.08238104, 253.44, '2026-02-07 09:47:48', '2026-02-07 09:48:48', '2026-02-07 09:54:48', '2026-02-07 09:59:48', '2026-02-07 10:22:48', NULL, 6218, 'completed'),
(8379, 6966, 'Rice Mill, Malvar', 'Senior High School, Malvar', 14.11434288, 121.10959210, 14.10555960, 121.10070047, 215.31, '2026-02-22 20:54:25', '2026-02-22 20:57:25', '2026-02-22 21:09:25', '2026-02-22 21:15:25', '2026-02-22 21:49:25', NULL, 4297, 'completed'),
(8404, 1445, 'Rice Mill, Banaybanay', 'Covered Court, Padre Garcia', 14.17965384, 121.08221319, 14.17656559, 121.09593668, 50.26, '2025-09-10 08:03:28', '2025-09-10 08:06:28', '2025-09-10 08:11:28', '2025-09-10 08:14:28', '2025-09-10 08:41:28', NULL, 4063, 'completed'),
(8427, 7527, 'Bus Stop, San Jose', 'Warehouse, Lipa City', 14.23909088, 121.14338723, 14.21536848, 121.13174479, 184.62, '2025-11-06 11:33:42', '2025-11-06 11:36:42', '2025-11-06 11:47:42', '2025-11-06 11:51:42', '2025-11-06 12:14:42', NULL, 5230, 'completed'),
(8453, 2409, 'Wet Market, Sampaguita', 'Barangay Hall, Sto. Tomas', 14.08665877, 121.17110875, 14.09885023, 121.15409218, 194.41, '2025-09-07 06:49:24', '2025-09-07 06:52:24', '2025-09-07 06:58:24', '2025-09-07 06:59:24', '2025-09-07 07:22:24', NULL, 6921, 'completed'),
(8455, 7669, 'Town Park, Balele', 'Municipal Library, Sto. Tomas', 14.04258446, 121.21934572, 14.01677035, 121.23611750, 112.61, '2025-12-01 22:08:14', '2025-12-01 22:10:14', '2025-12-01 22:18:14', '2025-12-01 22:20:14', '2025-12-01 22:41:14', NULL, 8714, 'completed'),
(8459, 1526, 'Barangay Plaza, Payapa', 'Police Station, Cuenca', 14.12668557, 121.21710278, 14.14341160, 121.20881088, 127.19, '2026-01-29 02:28:01', '2026-01-29 02:32:01', '2026-01-29 02:36:01', '2026-01-29 02:37:01', '2026-01-29 03:04:01', NULL, 4989, 'completed'),
(8465, 7669, 'Cooperative Office, Sampaguita', 'Farm Road, Tanauan City', 14.02097280, 121.19571353, 14.00682688, 121.21922839, 122.46, '2026-04-06 20:16:45', '2026-04-06 20:18:45', '2026-04-06 20:21:45', '2026-04-06 20:23:45', '2026-04-06 20:55:45', NULL, 8860, 'completed'),
(8478, 2913, 'Bus Stop, Dila', 'City Mall, Talisay', 14.11146970, 121.11854361, 14.09872358, 121.11095445, 83.13, '2025-12-25 23:19:29', '2025-12-25 23:21:29', '2025-12-25 23:29:29', '2025-12-25 23:34:29', '2025-12-25 23:53:29', NULL, 7083, 'completed'),
(8529, 1297, 'Town Park, Balele', 'Municipal Library, San Jose', 14.22310530, 121.01999523, 14.22242582, 121.02664748, 202.49, '2025-10-13 15:41:30', '2025-10-13 15:43:30', '2025-10-13 15:51:30', '2025-10-13 15:55:30', '2025-10-13 16:06:30', NULL, 8158, 'completed'),
(8641, 6616, 'Cooperative Office, Payapa', 'Barangay Hall, Cuenca', 14.06825020, 121.14037174, 14.08566911, 121.11729652, 80.98, '2025-10-15 17:28:00', '2025-10-15 17:33:00', '2025-10-15 17:41:00', '2025-10-15 17:43:00', '2025-10-15 17:56:00', NULL, 8782, 'completed'),
(8725, 2354, 'College Entrance, Sta. Cruz', 'Covered Court, Talisay', 14.03090099, 121.13371639, 14.00992706, 121.10582081, 88.02, '2025-09-15 03:35:22', '2025-09-15 03:36:22', '2025-09-15 03:43:22', '2025-09-15 03:44:22', '2025-09-15 04:11:22', NULL, 3362, 'completed'),
(8947, 1526, 'Gas Station, San Jose', 'Farm Road, Sto. Tomas', 14.03185842, 121.01369576, 14.06108469, 121.03179729, 122.49, '2025-11-20 05:54:08', '2025-11-20 05:57:08', '2025-11-20 06:05:08', '2025-11-20 06:09:08', '2025-11-20 06:31:08', NULL, 5624, 'completed'),
(8951, 2354, 'Bus Stop, Malvar', 'Subdivision Gate, San Jose', 14.18926755, 121.06821145, 14.19469507, 121.05126485, 80.09, '2026-04-06 13:54:28', '2026-04-06 13:55:28', '2026-04-06 14:03:28', '2026-04-06 14:06:28', '2026-04-06 14:25:28', NULL, 5882, 'completed'),
(9022, 4515, 'Public Market, Banaybanay', 'Subdivision Gate, Lipa City', 14.07425524, 121.06335428, 14.06418184, 121.06711908, 133.89, '2025-09-24 23:39:31', '2025-09-24 23:44:31', '2025-09-24 23:51:31', '2025-09-24 23:57:31', '2025-09-25 00:07:31', NULL, 5578, 'completed'),
(9041, 6616, 'Elementary School, San Isidro', 'Medical Clinic, Sto. Tomas', 14.09781468, 121.00521098, 14.09996586, 121.02413125, 201.14, '2025-11-29 21:46:43', '2025-11-29 21:52:43', '2025-11-29 21:59:43', '2025-11-29 22:01:43', '2025-11-29 22:18:43', NULL, 7262, 'completed'),
(9082, 4034, 'Highway Terminal, Maligaya', 'Public Cemetery, Lipa City', 14.03349470, 121.14490287, 14.01812527, 121.11745156, 50.77, '2025-08-04 21:23:01', '2025-08-04 21:28:01', '2025-08-04 21:32:01', '2025-08-04 21:33:01', '2025-08-04 21:59:01', NULL, 8447, 'completed'),
(9113, 9653, 'Health Center, Payapa', 'Police Station, San Jose', 14.07572761, 121.14631042, 14.06605664, 121.17220381, 254.11, '2026-03-29 20:17:55', '2026-03-29 20:24:55', '2026-03-29 20:36:55', '2026-03-29 20:41:55', '2026-03-29 20:52:55', NULL, 8358, 'completed'),
(9136, 4515, 'Rice Mill, Mahabang Parang', 'Senior High School, Padre Garcia', 14.21718766, 121.13489837, 14.19112585, 121.15191051, 172.28, '2026-03-27 19:00:42', '2026-03-27 19:03:42', '2026-03-27 19:15:42', '2026-03-27 19:18:42', '2026-03-27 19:32:42', NULL, 4677, 'completed'),
(9201, 5070, 'Town Park, Banaybanay', 'Police Station, Lipa City', 14.20452883, 121.00233712, 14.18023412, 120.97893881, 233.56, '2025-08-14 02:26:59', '2025-08-14 02:32:59', '2025-08-14 02:38:59', '2025-08-14 02:41:59', '2025-08-14 03:09:59', NULL, 4724, 'completed'),
(9313, 1297, 'Barangay Plaza, Balele', 'Medical Clinic, Sto. Tomas', 14.17731347, 121.19816985, 14.15695503, 121.21566373, 76.98, '2025-11-20 18:45:25', '2025-11-20 18:52:25', '2025-11-20 18:55:25', '2025-11-20 18:56:25', '2025-11-20 19:27:25', NULL, 5477, 'completed'),
(9618, 8637, 'Community Hospital, Bagong Silang', 'Covered Court, Lipa City', 14.09975197, 121.12455551, 14.11486349, 121.11877649, 139.91, '2025-11-12 17:28:38', '2025-11-12 17:30:38', '2025-11-12 17:41:38', '2025-11-12 17:43:38', '2025-11-12 18:08:38', NULL, 3869, 'completed'),
(9638, 1526, 'Elementary School, Balele', 'Covered Court, Lipa City', 14.05771425, 121.18169463, 14.03111557, 121.18964528, 99.04, '2025-12-24 09:54:03', '2025-12-24 09:57:03', '2025-12-24 10:09:03', '2025-12-24 10:14:03', '2025-12-24 10:26:03', NULL, 4409, 'completed'),
(9642, 2913, 'Highway Terminal, Bagong Silang', 'Warehouse, Padre Garcia', 14.21246109, 121.24562830, 14.23692233, 121.22768840, 240.85, '2025-09-25 07:42:08', '2025-09-25 07:44:08', '2025-09-25 07:50:08', '2025-09-25 07:52:08', '2025-09-25 08:10:08', NULL, 8636, 'completed'),
(9779, 1297, 'Wet Market, Poblacion', 'Farm Road, Rosario', 14.24327017, 121.04356877, 14.24612994, 121.03324149, 224.50, '2026-03-31 13:22:44', '2026-03-31 13:29:44', '2026-03-31 13:32:44', '2026-03-31 13:34:44', '2026-03-31 13:47:44', NULL, 9160, 'completed'),
(9868, 5536, 'Community Hospital, Balagtas', 'Transport Terminal, Cuenca', 14.07823510, 121.07107465, 14.08417895, 121.09316684, 89.26, '2025-12-24 11:17:16', '2025-12-24 11:24:16', '2025-12-24 11:31:16', '2025-12-24 11:35:16', '2025-12-24 11:46:16', NULL, 4494, 'completed'),
(9927, 4457, 'Wet Market, Calumpang', 'Medical Clinic, Tanauan City', 14.05379394, 121.15897935, 14.02411336, 121.16326298, 44.75, '2025-12-18 01:35:10', '2025-12-18 01:39:10', '2025-12-18 01:47:10', '2025-12-18 01:53:10', '2025-12-18 02:21:10', NULL, 9816, 'completed'),
(9949, 4034, 'Church Gate, Bagong Silang', 'City Mall, Tanauan City', 14.24045159, 121.02049566, 14.25490710, 121.01383302, 108.88, '2026-01-18 21:44:59', '2026-01-18 21:47:59', '2026-01-18 21:51:59', '2026-01-18 21:52:59', '2026-01-18 22:20:59', NULL, 3170, 'completed');

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
(8014, 6299, 'driver', 14.13553588, 121.02849213, 8427, 'Emergency button pressed during trip.', '2025-10-09 10:20:56', 'resolved'),
(8026, 3824, 'driver', 14.23017422, 121.15895069, 9113, 'User requested immediate assistance.', '2025-11-08 04:42:21', 'resolved'),
(8032, 6743, 'driver', 14.05790000, 121.15836242, 9022, 'Location shared for safety monitoring.', '2025-09-25 12:20:08', 'active'),
(8060, 1445, 'commuter', 14.15202710, 121.13992884, 7545, 'Follow-up required from LGU dashboard.', '2025-11-22 19:54:24', 'resolved'),
(8099, 2531, 'commuter', 14.03143631, 121.18643595, 9618, 'Follow-up required from LGU dashboard.', '2025-10-27 09:33:34', 'active'),
(8130, 1240, 'driver', 14.11573078, 121.23196531, 7870, 'Emergency button pressed during trip.', '2026-04-29 07:46:04', 'active'),
(8144, 1734, 'driver', 14.06708481, 121.15779752, 8140, 'SOS alert logged by mobile app.', '2026-02-17 13:01:36', 'active'),
(8212, 2447, 'commuter', 14.16050869, 121.14296992, 9868, 'Follow-up required from LGU dashboard.', '2026-03-14 01:44:03', 'resolved'),
(8239, 3089, 'driver', 14.10623574, 121.06319028, 8478, 'Location shared for safety monitoring.', '2025-11-08 10:22:52', 'active'),
(8336, 2938, 'commuter', 14.14115214, 121.14968273, 8453, 'Follow-up required from LGU dashboard.', '2025-12-30 02:14:15', 'resolved'),
(8356, 6299, 'driver', 14.18384412, 121.10514370, 7842, 'Emergency button pressed during trip.', '2026-01-21 10:14:08', 'resolved'),
(8387, 4796, 'driver', 14.24675773, 121.24501774, 8179, 'Emergency button pressed during trip.', '2025-10-16 06:34:19', 'resolved'),
(8395, 4191, 'driver', 14.09488489, 121.08855701, NULL, 'Location shared for safety monitoring.', '2026-02-14 13:50:45', 'resolved'),
(8438, 4346, 'driver', 14.20852900, 121.20246313, 8478, 'Emergency button pressed during trip.', '2026-03-14 21:02:42', 'active'),
(8451, 6791, 'driver', 14.04063242, 121.13688790, 8725, 'Follow-up required from LGU dashboard.', '2025-09-11 05:28:44', 'active'),
(8463, 1730, 'driver', 14.18638625, 121.05430575, 9313, 'Location shared for safety monitoring.', '2026-02-09 05:18:34', 'resolved'),
(8482, 2354, 'commuter', 14.01258702, 121.16523607, 8465, 'User requested immediate assistance.', '2026-01-19 07:49:00', 'resolved'),
(8501, 6929, 'driver', 14.24489123, 121.18670703, 8379, 'Location shared for safety monitoring.', '2025-09-27 21:28:52', 'active'),
(8551, 6299, 'driver', 14.13755980, 121.09022493, 7808, 'Follow-up required from LGU dashboard.', '2025-09-11 07:34:10', 'active'),
(8580, 8904, 'driver', 14.23534620, 121.01030326, 7061, 'Location shared for safety monitoring.', '2026-02-06 04:05:49', 'resolved'),
(8731, 8956, 'driver', 14.05097906, 121.14974990, NULL, 'Location shared for safety monitoring.', '2026-01-19 00:14:20', 'active'),
(8914, 7669, 'commuter', 14.04939195, 121.00962238, 7784, 'Follow-up required from LGU dashboard.', '2026-02-27 08:10:13', 'resolved'),
(8933, 1228, 'driver', 14.07635534, 121.10552810, NULL, 'Follow-up required from LGU dashboard.', '2025-09-05 08:45:14', 'resolved'),
(8998, 9658, 'commuter', 14.14579008, 121.21037695, 7201, 'Follow-up required from LGU dashboard.', '2025-11-11 02:45:13', 'active'),
(9049, 6799, 'driver', 14.23436481, 121.22745437, NULL, 'SOS alert logged by mobile app.', '2026-01-15 11:13:18', 'active'),
(9065, 7063, 'commuter', 14.02662158, 121.14116972, 7545, 'Location shared for safety monitoring.', '2026-01-11 14:07:28', 'active'),
(9176, 1445, 'commuter', 14.09270198, 121.17052654, 9779, 'User requested immediate assistance.', '2026-04-06 22:10:13', 'resolved'),
(9185, 2938, 'commuter', 14.18200674, 121.12495635, 7808, 'User requested immediate assistance.', '2025-08-19 18:05:59', 'active'),
(9203, 2394, 'commuter', 14.20116919, 121.19006776, 9201, 'User requested immediate assistance.', '2025-08-18 05:54:39', 'active'),
(9269, 1297, 'commuter', 14.07457145, 121.11560035, 8049, 'SOS alert logged by mobile app.', '2026-01-26 02:12:28', 'active'),
(9382, 1140, 'driver', 14.12081299, 121.15250726, 7021, 'Follow-up required from LGU dashboard.', '2025-12-10 13:24:07', 'active'),
(9385, 6791, 'driver', 14.10681043, 121.20800450, NULL, 'Emergency button pressed during trip.', '2025-09-13 21:09:49', 'active'),
(9443, 2409, 'commuter', 14.17137036, 121.10520785, NULL, 'SOS alert logged by mobile app.', '2025-09-06 09:03:14', 'active'),
(9565, 1734, 'driver', 14.24995281, 121.14921124, 7208, 'Emergency button pressed during trip.', '2025-12-13 18:18:02', 'active'),
(9588, 6552, 'commuter', 14.15935279, 121.09431946, 9041, 'Follow-up required from LGU dashboard.', '2025-10-24 21:43:56', 'active'),
(9616, 9653, 'commuter', 14.21086516, 121.24496886, NULL, 'User requested immediate assistance.', '2025-08-30 10:02:23', 'active'),
(9696, 1297, 'commuter', 14.02425565, 121.12019077, 9136, 'Follow-up required from LGU dashboard.', '2026-04-28 11:47:27', 'active'),
(9721, 2409, 'commuter', 14.12145320, 121.24854246, 7545, 'Location shared for safety monitoring.', '2026-01-30 03:50:13', 'active'),
(9765, 2394, 'commuter', 14.02354345, 121.19531306, NULL, 'Emergency button pressed during trip.', '2026-04-02 15:39:40', 'active'),
(9785, 1526, 'commuter', 14.11121713, 121.04564853, 7808, 'Follow-up required from LGU dashboard.', '2026-02-06 16:15:54', 'resolved'),
(9819, 1240, 'driver', 14.14831817, 121.14270690, 7407, 'Location shared for safety monitoring.', '2025-11-18 07:04:13', 'resolved'),
(9837, 6616, 'commuter', 14.13424925, 121.04445882, 8465, 'User requested immediate assistance.', '2026-04-23 00:07:41', 'active'),
(9890, 4370, 'commuter', 14.07331924, 121.07263673, 7808, 'Follow-up required from LGU dashboard.', '2025-12-23 10:24:15', 'active'),
(9895, 7506, 'commuter', 14.04133588, 121.03196723, NULL, 'Emergency button pressed during trip.', '2025-09-24 11:59:12', 'active'),
(9905, 1140, 'driver', 14.20650303, 121.07711739, 7753, 'Location shared for safety monitoring.', '2026-03-21 14:37:58', 'active'),
(9940, 9658, 'commuter', 14.03067657, 121.18903632, 8379, 'SOS alert logged by mobile app.', '2026-01-05 08:22:21', 'resolved'),
(9945, 2394, 'commuter', 14.03575174, 121.19698271, 8478, 'SOS alert logged by mobile app.', '2025-09-25 00:38:35', 'resolved'),
(9951, 2938, 'commuter', 14.20760304, 121.14920364, 8049, 'Location shared for safety monitoring.', '2026-04-20 21:16:15', 'active'),
(9955, 4346, 'driver', 14.16495320, 121.13416505, 7694, 'Emergency button pressed during trip.', '2025-11-19 10:53:46', 'resolved'),
(9996, 2711, 'driver', 14.08142818, 121.06919132, 7842, 'Emergency button pressed during trip.', '2025-10-29 19:32:22', 'resolved');

-- --------------------------------------------------------

--
-- Table structure for table `todas`
--

CREATE TABLE `todas` (
  `toda_id` int NOT NULL,
  `toda_name` varchar(150) NOT NULL,
  `toda_code` varchar(50) DEFAULT NULL,
  `president_user_id` int NOT NULL,
  `barangay` varchar(150) NOT NULL,
  `municipality` varchar(150) DEFAULT NULL,
  `route_description` text NOT NULL,
  `letter_of_intent_document` varchar(255) NOT NULL,
  `officers_list_document` varchar(255) NOT NULL,
  `members_list_document` varchar(255) NOT NULL,
  `barangay_approval_document` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected','inactive') NOT NULL DEFAULT 'pending',
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_user_id` int DEFAULT NULL,
  `review_remarks` text,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `todas`
--

INSERT INTO `todas` (`toda_id`, `toda_name`, `toda_code`, `president_user_id`, `barangay`, `municipality`, `route_description`, `letter_of_intent_document`, `officers_list_document`, `members_list_document`, `barangay_approval_document`, `status`, `submitted_at`, `reviewed_at`, `reviewed_by_user_id`, `review_remarks`, `approved_at`, `created_at`, `updated_at`) VALUES
(2005, 'Balele TODA Federation ZRT', 'TD-YO476', 3089, 'San Isidro', 'Lipa City', 'San Isidro to Farm Road via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-10-25 19:39:26', '2025-11-12 01:39:26', 2981, 'LGU verified route and officer list.', '2025-11-12 05:39:26', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2006, 'Dila Drivers Alliance VLT', 'TD-1Y323', 4668, 'Banaybanay', 'Padre Garcia', 'Banaybanay to Public Cemetery via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775171134817-9431e5f8-a4c7-2bd0-62cb-ef2fbbc09b76.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-19 11:34:49', '2025-03-27 20:34:49', 2981, 'Approved after document validation.', '2025-03-28 03:34:49', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2463, 'Mahabang Parang Transport Service Group 381', 'TD-QF730', 6743, 'San Jose', 'Malvar', 'San Jose to Public Cemetery via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-06-12 11:13:55', '2025-06-15 20:13:55', 4090, 'Approved after document validation.', '2025-06-15 22:13:55', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2499, 'Mabini Tricycle Operators Association D26', 'TD-NY576', 5152, 'Payapa', 'Malvar', 'Payapa to Senior High School via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-02 22:51:04', '2025-03-19 01:51:04', 4090, 'Approved with complete barangay endorsement.', '2025-03-19 03:51:04', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2564, 'San Isidro TODA Federation V63', 'TD-NX111', 1538, 'Banaybanay', 'Lipa City', 'Banaybanay to Subdivision Gate via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-21 20:31:14', '2025-03-30 06:31:14', 3599, 'Approved after document validation.', '2025-03-30 14:31:14', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2792, 'Tambo Tricycle Operators Association F2Q', 'TD-CM352', 5152, 'Maligaya', 'Talisay', 'Maligaya to Junction via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1776119876932-d1783b2b-cbd4-9832-0f89-6a155ebccb71.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-07-19 03:06:18', '2025-08-01 09:06:18', 3032, 'Approved with complete barangay endorsement.', '2025-08-01 12:06:18', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2822, 'Balagtas Tricycle Operators Association TKB', 'TD-RY211', 8208, 'Poblacion', 'Balete', 'Poblacion to Subdivision Gate via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1777729679269-ddcc68fd-b11c-bc69-780e-ea39e738a2f2.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-02-22 20:27:59', '2025-03-03 07:27:59', 1510, 'Approved with complete barangay endorsement.', '2025-03-03 13:27:59', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3037, 'Poblacion Tricycle Operators Association XA7', 'TD-I8708', 3089, 'Mabini', 'Rosario', 'Mabini to Transport Terminal via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1776944008601-feec1c62-0435-65b9-7053-2df566c00f94.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-01 19:14:26', '2025-08-16 20:14:26', 4090, 'Approved after document validation.', '2025-08-17 06:14:26', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3133, 'Tambo Transport Service Group LQE', 'TD-CF424', 3089, 'Sampaguita', 'Talisay', 'Sampaguita to City Mall via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-01-09 02:48:48', '2026-01-16 13:48:48', 2981, 'Approved with complete barangay endorsement.', '2026-01-16 19:48:48', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3357, 'Pansol Transport Service Group 50F', 'TD-D7514', 4668, 'San Roque', 'Talisay', 'San Roque to Barangay Hall via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-13 00:00:42', '2025-04-17 03:00:42', 1510, 'LGU verified route and officer list.', '2025-04-17 06:00:42', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3665, 'Poblacion Drivers Alliance 6P5', 'TD-UU338', 6743, 'Sampaguita', 'Balete', 'Sampaguita to Covered Court via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1777505036982-25cfad2f-4e1e-8bfe-3782-76eb6d4ab519.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-03-23 00:13:18', '2026-04-04 12:13:18', 4090, 'Approved after document validation.', '2026-04-04 23:13:18', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3702, 'Bagong Silang Transport Service Group YB4', 'TD-RS306', 8208, 'Bagong Silang', 'Malvar', 'Bagong Silang to Junction via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-02-04 18:19:57', '2026-02-12 02:19:57', 4090, 'Approved with complete barangay endorsement.', '2026-02-12 04:19:57', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3878, 'Balele Drivers Alliance O9E', 'TD-OI342', 4635, 'Bagong Silang', 'Cuenca', 'Bagong Silang to Senior High School via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775891117090-8e609943-6b7f-8177-a14b-b92fd4486c30.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-01-17 01:05:14', '2025-01-29 08:05:14', 3032, 'Documents matched registration records.', '2025-01-29 09:05:14', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4052, 'San Isidro Transport Service Group E47', 'TD-28581', 4635, 'Dila', 'Lipa City', 'Dila to Hardware Store via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1777744380945-42d8fdcf-031e-ae7f-0a9c-ea9a28ad1051.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-12-10 13:44:14', '2025-12-15 19:44:14', 4090, 'Approved with complete barangay endorsement.', '2025-12-16 03:44:14', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4271, 'Banaybanay Drivers Alliance D45', 'TD-EJ152', 8208, 'San Jose', 'Tanauan City', 'San Jose to Municipal Library via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-12-01 14:58:38', '2025-12-08 17:58:38', 1510, 'Approved after document validation.', '2025-12-08 22:58:38', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4404, 'Sampaguita Tricycle Operators Association 4EO', 'TD-3M822', 3658, 'Banaybanay', 'Cuenca', 'Banaybanay to Medical Clinic via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-10-23 23:35:28', '2025-11-04 03:35:28', 2981, 'Approved after document validation.', '2025-11-04 12:35:28', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4648, 'Maligaya Drivers Alliance M4Z', 'TD-ZC198', 4635, 'San Isidro', 'Tanauan City', 'San Isidro to Farm Road via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-15 10:26:23', '2025-03-21 20:26:23', 1510, 'Documents matched registration records.', '2025-03-22 04:26:23', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4828, 'Mataas na Lupa Drivers Alliance CLT', 'TD-A2514', 3658, 'Balele', 'Sto. Tomas', 'Balele to Public Cemetery via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-01 02:05:45', '2025-04-14 10:05:45', 8578, 'Approved with complete barangay endorsement.', '2025-04-14 12:05:45', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5035, 'Sta. Cruz Drivers Alliance 5S3', 'TD-R0330', 9270, 'Balagtas', 'Malvar', 'Balagtas to Medical Clinic via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775081668161-c9d7ba00-bb04-9785-554d-7492147d6438.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-09-20 17:21:43', '2025-10-03 22:21:43', 3599, 'Approved after document validation.', '2025-10-04 05:21:43', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5106, 'Calumpang TODA Federation OOV', 'TD-ES870', 6743, 'Sta. Cruz', 'Cuenca', 'Sta. Cruz to Transport Terminal via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1777744389088-6556b5bf-09f4-c74e-ef34-a8145a009aac.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-02-13 10:40:31', '2025-02-19 18:40:31', 1510, 'Approved after document validation.', '2025-02-20 06:40:31', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5446, 'Sampaguita TODA Federation J9E', 'TD-RS470', 8208, 'Balele', 'Padre Garcia', 'Balele to Covered Court via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-12-06 17:47:21', '2025-12-12 05:47:21', 3032, 'Approved with complete barangay endorsement.', '2025-12-12 12:47:21', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5460, 'Malvar Tricycle Operators Association 10U', 'TD-MO458', 4635, 'San Jose', 'Padre Garcia', 'San Jose to Senior High School via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-02-14 19:05:35', '2025-02-23 21:05:35', 3032, 'Documents matched registration records.', '2025-02-24 08:05:35', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5535, 'Malvar Transport Service Group OBG', 'TD-UQ200', 3658, 'San Jose', 'Lipa City', 'San Jose to Municipal Library via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-06-04 01:44:34', '2025-06-17 02:44:34', 8578, 'LGU verified route and officer list.', '2025-06-17 03:44:34', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5573, 'Balagtas Transport Service Group 22P', 'TD-3Q602', 4191, 'Balagtas', 'Lipa City', 'Balagtas to Public Cemetery via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-28 16:24:13', '2025-05-08 19:24:13', 4090, 'Approved after document validation.', '2025-05-09 07:24:13', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5736, 'San Jose Drivers Alliance CUT', 'TD-XN733', 1538, 'Dila', 'Padre Garcia', 'Dila to Bakery Corner via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-01-17 19:21:55', '2025-02-05 22:21:55', 2981, 'Documents matched registration records.', '2025-02-06 00:21:55', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6344, 'Mabini Tricycle Operators Association S89', 'TD-FU581', 9270, 'Balagtas', 'Balete', 'Balagtas to Subdivision Gate via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775523097921-3c815d34-9d62-7592-fc22-3ed0c4699ccf.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-09-04 00:19:37', '2025-09-16 01:19:37', 3599, 'Documents matched registration records.', '2025-09-16 11:19:37', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6437, 'Bagong Silang TODA Federation 9J6', 'TD-1W727', 4191, 'Mabini', 'Malvar', 'Mabini to Covered Court via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1778193400228-a0b2a83e-bcd8-4152-3179-51c0b478906a.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-07-27 13:18:17', '2025-08-10 01:18:17', 4090, 'LGU verified route and officer list.', '2025-08-10 05:18:17', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6499, 'Payapa Transport Service Group FX2', 'TD-XR891', 1538, 'Maligaya', 'Sto. Tomas', 'Maligaya to Transport Terminal via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775159540042-4a376865-da6a-e6b8-5e29-fac77553b480.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-19 07:34:31', '2025-03-25 15:34:31', 1510, 'Approved with complete barangay endorsement.', '2025-03-26 03:34:31', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6543, 'Payapa Tricycle Operators Association FEI', 'TD-48855', 2064, 'San Jose', 'Talisay', 'San Jose to Farm Road via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-11-22 01:11:37', '2025-12-05 02:11:37', 1510, 'Approved after document validation.', '2025-12-05 12:11:37', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6555, 'Banaybanay Drivers Alliance OJ3', 'TD-4J731', 9270, 'Bagong Silang', 'Talisay', 'Bagong Silang to Junction via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-11-04 07:59:06', '2025-11-24 13:59:06', 1510, 'LGU verified route and officer list.', '2025-11-24 22:59:06', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6794, 'San Roque Tricycle Operators Association WHR', 'TD-CH617', 3089, 'Sampaguita', 'Tanauan City', 'Sampaguita to Warehouse via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-31 15:45:51', '2025-09-08 00:45:51', 2981, 'Approved after document validation.', '2025-09-08 10:45:51', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7288, 'Poblacion Drivers Alliance TUD', 'TD-UG644', 4635, 'Maligaya', 'Lipa City', 'Maligaya to Covered Court via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-06-11 11:54:21', '2025-06-24 23:54:21', 4090, 'Approved after document validation.', '2025-06-25 05:54:21', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7501, 'Maligaya Transport Service Group SNX', 'TD-TL823', 1538, 'Payapa', 'San Jose', 'Payapa to Public Cemetery via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-05-08 17:15:20', '2025-05-27 18:15:20', 2981, 'Approved with complete barangay endorsement.', '2025-05-27 23:15:20', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7768, 'Poblacion Transport Service Group 6T8', 'TD-DX293', 8208, 'Bagong Silang', 'Cuenca', 'Bagong Silang to Municipal Library via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775764305324-b68100e2-b87e-09e2-27d9-30fb0cf137dc.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-25 15:23:25', '2025-05-02 19:23:25', 3599, 'LGU verified route and officer list.', '2025-05-03 01:23:25', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7951, 'San Roque TODA Federation 9AK', 'TD-TO167', 4635, 'Sampaguita', 'Cuenca', 'Sampaguita to Hardware Store via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-05 04:16:07', '2025-04-15 08:16:07', 4090, 'Documents matched registration records.', '2025-04-15 19:16:07', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8008, 'Pansol Drivers Alliance Z1N', 'TD-PX971', 6743, 'San Jose', 'San Jose', 'San Jose to Transport Terminal via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-03-27 10:55:29', '2026-04-03 13:55:29', 2981, 'Documents matched registration records.', '2026-04-03 17:55:29', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8267, 'Mataas na Lupa Transport Service Group WP2', 'TD-AS226', 4668, 'Malvar', 'Rosario', 'Malvar to Municipal Library via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-02-03 01:55:47', '2025-02-11 07:55:47', 1510, 'LGU verified route and officer list.', '2025-02-11 15:55:47', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8309, 'Pansol TODA Federation NBD', 'TD-RU164', 9270, 'Dila', 'Sto. Tomas', 'Dila to Hardware Store via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-09-06 16:29:03', '2025-09-25 19:29:03', 8578, 'Documents matched registration records.', '2025-09-25 22:29:03', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8369, 'Sampaguita Drivers Alliance HIF', 'TD-M8816', 2606, 'Balele', 'Balete', 'Balele to Warehouse via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1778910737168-f1e41105-1490-3a9f-7470-89c09cd38380.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-03-12 23:57:51', '2026-03-20 05:57:51', 3032, 'Documents matched registration records.', '2026-03-20 10:57:51', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8601, 'Bagong Silang Drivers Alliance T1Z', 'TD-QH123', 5152, 'Balagtas', 'San Jose', 'Balagtas to Bakery Corner via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-04-11 16:52:05', '2025-04-17 18:52:05', 2981, 'Documents matched registration records.', '2025-04-18 04:52:05', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8623, 'Balagtas TODA Federation WSB', 'TD-DF466', 4191, 'Balele', 'Padre Garcia', 'Balele to City Mall via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1776161239467-2a3d389a-aaad-4c78-a19c-31a491322b0d.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-19 00:31:15', '2025-08-21 09:31:15', 4090, 'LGU verified route and officer list.', '2025-08-21 21:31:15', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8696, 'Sta. Cruz TODA Federation E6Q', 'TD-OE978', 2606, 'Tambo', 'Balete', 'Tambo to Senior High School via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1776132474160-b9129de6-83c6-5af0-49d7-085ca16e2526.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-10 20:53:45', '2025-08-19 23:53:45', 2981, 'Approved after document validation.', '2025-08-20 00:53:45', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8794, 'Payapa Tricycle Operators Association FAA', 'TD-CW879', 2064, 'Mataas na Lupa', 'Cuenca', 'Mataas na Lupa to Bakery Corner via farm access road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1778338750166-28809653-6197-2163-bd3f-de138c95b6e4.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-03-25 06:08:09', '2025-04-09 10:08:09', 3599, 'Documents matched registration records.', '2025-04-09 15:08:09', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8903, 'Payapa Tricycle Operators Association V1M', 'TD-37337', 4635, 'Bagong Silang', 'Padre Garcia', 'Bagong Silang to Public Cemetery via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-07-18 10:35:13', '2025-07-20 18:35:13', 4090, 'Approved after document validation.', '2025-07-20 22:35:13', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9169, 'Malvar Transport Service Group V95', 'TD-2A377', 3089, 'Dila', 'Padre Garcia', 'Dila to Transport Terminal via market road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-10-05 01:22:36', '2025-10-19 05:22:36', 4090, 'Documents matched registration records.', '2025-10-19 10:22:36', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9297, 'Mahabang Parang Tricycle Operators Association 1T4', 'TD-YL845', 3089, 'Dila', 'Balete', 'Dila to Public Cemetery via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1777726651291-1e09dc35-bfa1-a6eb-9a7d-248c82a851a2.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-07 22:34:52', '2025-08-22 08:34:52', 2981, 'Approved with complete barangay endorsement.', '2025-08-22 09:34:52', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9370, 'Bagong Silang Tricycle Operators Association IFI', 'TD-0E497', 2606, 'Balagtas', 'Cuenca', 'Balagtas to Bakery Corner via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775223057142-506d025a-9169-47a3-abfb-c26bc235aab6.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2026-03-10 00:32:13', '2026-03-25 02:32:13', 8578, 'Approved after document validation.', '2026-03-25 12:32:13', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9599, 'Banaybanay Tricycle Operators Association DRB', 'TD-HY288', 4635, 'Balele', 'Padre Garcia', 'Balele to Warehouse via national highway', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-10-28 01:14:38', '2025-11-16 11:14:38', 4090, 'LGU verified route and officer list.', '2025-11-16 12:14:38', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9797, 'Balagtas TODA Federation OBL', 'TD-EH476', 4191, 'Maligaya', 'Padre Garcia', 'Maligaya to Farm Road via barangay road', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '/uploads/driver-documents/1775184962564-81bb7ee3-94a8-5cbb-0c19-872abb30988e.pdf', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-06-07 09:00:02', '2025-06-25 19:00:02', 4090, 'Approved with complete barangay endorsement.', '2025-06-26 07:00:02', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9911, 'Poblacion Drivers Alliance 9DD', 'TD-66254', 4668, 'Maligaya', 'Rosario', 'Maligaya to Municipal Library via main terminal', '/uploads/driver-documents/1775185603383-fbadc53e-dfef-4516-ab2e-6e2d0368e381.pdf', '/uploads/driver-documents/1775185603465-381f8772-867a-43c7-9b7b-4782669e1b6c.pdf', '', '/uploads/driver-documents/1775185603576-fc017445-ce96-44de-a1b5-b0e377f2ca67.pdf', 'approved', '2025-08-03 06:27:47', '2025-08-14 14:27:47', 1510, 'LGU verified route and officer list.', '2025-08-14 22:27:47', '2026-05-03 15:23:22', '2026-05-03 15:23:22');

--
-- Triggers `todas`
--
DELIMITER $$
CREATE TRIGGER `trg_todas_before_insert` BEFORE INSERT ON `todas` FOR EACH ROW BEGIN
  DECLARE president_role VARCHAR(20);
  DECLARE reviewer_role VARCHAR(20);

  SELECT `role` INTO president_role
  FROM `users`
  WHERE `user_id` = NEW.`president_user_id`
  LIMIT 1;

  IF president_role IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected TODA president account does not exist.';
  END IF;

  IF president_role <> 'driver' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only driver accounts can create a TODA record.';
  END IF;

  IF NEW.`reviewed_by_user_id` IS NOT NULL THEN
    SELECT `role` INTO reviewer_role
    FROM `users`
    WHERE `user_id` = NEW.`reviewed_by_user_id`
    LIMIT 1;

    IF reviewer_role IS NULL OR reviewer_role <> 'lgu' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only an LGU account can review a TODA application.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_by_user_id` IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A reviewed TODA application must have an LGU reviewer.';
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_at` IS NULL THEN
    SET NEW.`reviewed_at` = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.`status` = 'approved' AND NEW.`approved_at` IS NULL THEN
    SET NEW.`approved_at` = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.`status` <> 'approved' THEN
    SET NEW.`approved_at` = NULL;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_todas_before_update` BEFORE UPDATE ON `todas` FOR EACH ROW BEGIN
  DECLARE president_role VARCHAR(20);
  DECLARE reviewer_role VARCHAR(20);

  SELECT `role` INTO president_role
  FROM `users`
  WHERE `user_id` = NEW.`president_user_id`
  LIMIT 1;

  IF president_role IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected TODA president account does not exist.';
  END IF;

  IF president_role <> 'driver' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only driver accounts can own a TODA.';
  END IF;

  IF NEW.`reviewed_by_user_id` IS NOT NULL THEN
    SELECT `role` INTO reviewer_role
    FROM `users`
    WHERE `user_id` = NEW.`reviewed_by_user_id`
    LIMIT 1;

    IF reviewer_role IS NULL OR reviewer_role <> 'lgu' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only an LGU account can review a TODA application.';
    END IF;
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_by_user_id` IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A reviewed TODA application must have an LGU reviewer.';
  END IF;

  IF NEW.`status` IN ('approved','rejected') AND NEW.`reviewed_at` IS NULL THEN
    SET NEW.`reviewed_at` = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.`status` = 'approved' AND NEW.`approved_at` IS NULL THEN
    SET NEW.`approved_at` = CURRENT_TIMESTAMP;
  END IF;

  IF NEW.`status` <> 'approved' THEN
    SET NEW.`approved_at` = NULL;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tricycles`
--

CREATE TABLE `tricycles` (
  `tricycle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `toda_id` int DEFAULT NULL,
  `body_number` varchar(50) DEFAULT NULL,
  `plate_number` varchar(50) NOT NULL,
  `make_model` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `engine_number` varchar(100) DEFAULT NULL,
  `chassis_number` varchar(100) DEFAULT NULL,
  `qr_code_value` varchar(255) DEFAULT NULL,
  `franchise_expiry` date DEFAULT NULL,
  `status` enum('pending','approved','rejected','expired','suspended') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tricycles`
--

INSERT INTO `tricycles` (`tricycle_id`, `driver_id`, `toda_id`, `body_number`, `plate_number`, `make_model`, `color`, `engine_number`, `chassis_number`, `qr_code_value`, `franchise_expiry`, `status`, `created_at`, `updated_at`) VALUES
(4033, 5578, 8601, 'BN-P391-DD', 'DVA-2024', 'Suzuki GD 110', 'Maroon', 'ENE6ZQT30DF', 'CHZV4LJC4Y4P', 'TRIKESEC-GRVT04-760', '2027-04-17', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4423, 4178, 6794, 'BN-S119-DN', 'TSC-7534', 'Rusi Classic 250', 'Black', 'ENMX3YWDGPY', 'CHH1Z4R15PY3', 'TRIKESEC-ZQ9K2J-717', '2029-01-17', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4525, 9641, 6437, 'BN-T341-4O', 'BTG-3991', 'Suzuki GD 110', 'Yellow', 'ENYJZ95O2KM', 'CHSOHQTQCGFH', 'TRIKESEC-K4GYRG-692', '2028-07-24', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4920, 9160, 5535, 'BN-S577-O7', 'TSC-6480', 'Kawasaki Barako II', 'Navy', 'ENI5EF88OYL', 'CHKGAA5RVOW5', 'TRIKESEC-53HPNL-255', '2027-01-03', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5048, 6218, 2822, 'BN-P839-89', 'TSC-9524', 'Kymco Kargador 150', 'Silver', 'ENHWITS8XYA', 'CHOPDL9A3G2E', 'TRIKESEC-LKB8B7-282', '2027-11-22', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5088, 7790, 9370, 'BN-E107-EZ', 'TSC-2975', 'Rusi Classic 250', 'Silver', 'ENY7TMLNFXA', 'CH9YY8XO27VN', 'TRIKESEC-Z74UIF-791', '2026-09-14', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5202, 8158, 2564, 'BN-N187-WE', 'BTG-2008', 'Yamaha YTX 125', 'Gray', 'ENRPGAT7DHF', 'CHNMNATI706R', 'TRIKESEC-S5251X-380', '2028-01-07', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5282, 3875, 2463, 'BN-B190-5J', 'MNL-3729', 'TVS King Deluxe', 'Black', 'ENC75D5E7ER', 'CHSUNRGE9O1H', 'TRIKESEC-OI44KK-596', '2027-11-04', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5313, 8524, 6555, 'BN-S985-9D', 'RKP-5744', 'Honda TMX Supremo', 'Black', 'ENTBZS6T7Z0', 'CHXSWZ73PI1W', 'TRIKESEC-3O8CMO-532', '2028-10-23', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5494, 5624, 2564, 'BN-R390-BW', 'TRK-6621', 'Honda TMX 125', 'Yellow', 'ENZUYVKUH5C', 'CHUJCIXYV8PD', 'TRIKESEC-IJ0YFK-345', '2027-07-27', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5557, 9286, 8601, 'BN-D829-22', 'MNL-5793', 'Suzuki GD 110', 'Red', 'EN3Q1ERM4NI', 'CHOIAXGTQRGE', 'TRIKESEC-R52TE2-973', '2027-03-03', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5813, 6446, 2564, 'BN-F388-IA', 'LPU-4569', 'Honda TMX 125', 'Blue', 'EN9KONWBL7W', 'CHRM88KLVUHV', 'TRIKESEC-E2C7R1-782', '2028-07-14', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6085, 8782, 6543, 'BN-Y264-HU', 'LPU-8211', 'Kawasaki Barako II', 'White', 'ENFY7740L7G', 'CHH7UUIVUE2B', 'TRIKESEC-04BLGG-660', '2028-06-29', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6096, 6747, 6543, 'BN-C631-UG', 'BTG-4139', 'Kymco Kargador 150', 'Green', 'ENS55W0ZHZ1', 'CH6FBC69KO4D', 'TRIKESEC-TJ7679-337', '2027-06-29', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6112, 4081, 8601, 'BN-C206-X4', 'BTG-8152', 'Suzuki GD 110', 'White', 'ENAYW0OZ4B9', 'CHYCTMMN5MNG', 'TRIKESEC-O3YP40-926', '2027-01-18', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6165, 4494, 7951, 'BN-M697-D4', 'RKP-6196', 'Bajaj RE Compact', 'Silver', 'ENQ8FZY3M91', 'CHXGLMXJVIGP', 'TRIKESEC-G15TF5-186', '2027-04-08', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6363, 4204, 6555, 'BN-N339-GE', 'DVA-1038', 'TVS King Deluxe', 'Orange', 'ENA6N4TN6IX', 'CHL1TBPNFTNJ', 'TRIKESEC-SVW0SN-784', '2029-03-11', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6456, 5434, 3357, 'BN-M731-45', 'TSC-6821', 'Yamaha YTX 125', 'Orange', 'ENYG3KTG0IM', 'CH3T6LMHTK4A', 'TRIKESEC-OL744U-848', '2028-04-09', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6629, 4724, 7951, 'BN-Z121-IN', 'MNL-6236', 'TVS King Deluxe', 'Yellow', 'EN5GE4TV9HC', 'CHJSPKOLQDMD', 'TRIKESEC-QUGUOI-346', '2028-03-07', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6677, 4989, 6543, 'BN-F890-6L', 'TRK-7208', 'Rusi Classic 250', 'Silver', 'ENRNSP30A31', 'CHLNMGG14T4G', 'TRIKESEC-BUZOWS-381', '2027-08-31', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6990, 5082, 3357, 'BN-W768-PV', 'DVA-1445', 'Bajaj RE Compact', 'Blue', 'ENIK6BVD1UU', 'CHIDK48E7F3G', 'TRIKESEC-D6MB91-802', '2028-03-20', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7088, 7083, 6543, 'BN-V188-XO', 'TRK-2307', 'TVS King Deluxe', 'Orange', 'EN9SZOWPK6S', 'CH4G3CG3U1JZ', 'TRIKESEC-A4CYRW-764', '2027-12-19', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7223, 8636, 3357, 'BN-E465-KF', 'BTG-6876', 'Bajaj RE Compact', 'Navy', 'EN19A334N6I', 'CH2OX2M40TKF', 'TRIKESEC-GPNEFN-764', '2027-07-21', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7290, 5882, 6437, 'BN-D153-HU', 'TRK-2506', 'Kymco Kargador 150', 'Blue', 'EN3SF2PIJCG', 'CHMLTN9VU26E', 'TRIKESEC-AJPYHX-737', '2026-07-22', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7295, 8447, 2822, 'BN-V717-ZT', 'TRK-3329', 'Suzuki GD 110', 'White', 'EN6NMPYIPSW', 'CHXFAV80LRYO', 'TRIKESEC-81N7IQ-333', '2027-03-23', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7554, 5369, 2564, 'BN-I887-0M', 'DVA-7035', 'Yamaha YTX 125', 'Navy', 'EN63AAXKF8F', 'CHR56USYZ6LF', 'TRIKESEC-97A9RX-578', '2029-02-04', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7577, 7312, 8601, 'BN-W864-C6', 'TRK-8211', 'Honda TMX Supremo', 'Green', 'ENOVYPNW8FX', 'CHE0WR8CVO0G', 'TRIKESEC-UCCVW3-356', '2027-05-21', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7626, 9816, 2463, 'BN-N428-FE', 'TSC-4640', 'Suzuki GD 110', 'Gray', 'EN4M4VQW4YI', 'CH7CSZWFEKGE', 'TRIKESEC-A7CO7L-914', '2028-02-19', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7714, 3362, 5535, 'BN-B971-UH', 'MNL-4356', 'Rusi Classic 250', 'White', 'ENXOXHPKE6Q', 'CHVQYPSF8L4B', 'TRIKESEC-6O7IU0-909', '2027-07-06', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7869, 4297, 9370, 'BN-P718-WO', 'MNL-3660', 'Bajaj RE Compact', 'Navy', 'EN9Y5D59FQ9', 'CH2DTBAQG7TF', 'TRIKESEC-HDTJM5-258', '2027-02-21', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7978, 8358, 6437, 'BN-G269-ZQ', 'LPU-9101', 'Kymco Kargador 150', 'Gray', 'ENPX78NWJ7B', 'CHTZWTY2WP6C', 'TRIKESEC-6SSA5V-107', '2028-02-07', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8025, 5230, 2463, 'BN-I349-ZR', 'BTG-1835', 'Bajaj RE Compact', 'Orange', 'EN2LJOLNM5D', 'CHXQ1QK58DQ2', 'TRIKESEC-790FVP-940', '2028-03-13', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8119, 4677, 7951, 'BN-X734-4P', 'DVA-3409', 'Yamaha YTX 125', 'Silver', 'EN7B1JOYAYW', 'CHKGAVVGRWMK', 'TRIKESEC-1S7YGU-846', '2027-10-16', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8160, 3568, 6555, 'BN-G374-TK', 'BTG-7162', 'Kymco Kargador 150', 'Orange', 'ENK39HRYF3L', 'CH8WWYC458WU', 'TRIKESEC-QU9VZ8-847', '2027-01-01', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8354, 3869, 3357, 'BN-J992-EI', 'RKP-6348', 'Honda TMX 125', 'Orange', 'ENF478S4XQX', 'CHQFTHRBWOPL', 'TRIKESEC-FE1JB0-397', '2027-03-20', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8786, 4063, 6794, 'BN-N348-9M', 'BTG-7874', 'Honda TMX Supremo', 'Silver', 'ENI3H1VIGFF', 'CHAXWF1IAR6O', 'TRIKESEC-N4F0X9-939', '2028-06-29', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8790, 3170, 2463, 'BN-K879-NC', 'MNL-4229', 'Honda TMX Supremo', 'Maroon', 'ENB3VI84HSV', 'CHU6495FN26Y', 'TRIKESEC-KBTJEE-553', '2027-01-09', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8792, 5477, 9370, 'BN-E819-2Z', 'DVA-8453', 'Rusi Classic 250', 'White', 'EN4WG75KKWS', 'CHTYHGR4IN47', 'TRIKESEC-4P10M3-967', '2027-02-26', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8824, 8445, 2463, 'BN-U737-IB', 'RKP-3163', 'Honda TMX 125', 'Blue', 'ENNUVLD8RE5', 'CH15GUS54M3D', 'TRIKESEC-ZQUCNA-204', '2028-11-18', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8913, 7262, 8601, 'BN-G351-BC', 'BTG-8363', 'Yamaha YTX 125', 'Blue', 'ENYGZNX5ONS', 'CH8UWTOCWRII', 'TRIKESEC-BQ6N6U-468', '2027-09-30', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8979, 8714, 6794, 'BN-E381-L8', 'BTG-6112', 'TVS King Deluxe', 'Yellow', 'ENSVEXTC4SB', 'CH8BCOIG6GW2', 'TRIKESEC-9UVHO8-180', '2027-07-07', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9048, 3940, 9370, 'BN-T138-M2', 'LPU-2790', 'TVS King Deluxe', 'Navy', 'ENB8BTQXZ4X', 'CHYNQOKRI6F3', 'TRIKESEC-KM0JWZ-101', '2028-06-08', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9116, 8860, 6555, 'BN-R403-J7', 'TRK-7939', 'TVS King Deluxe', 'White', 'EN50DCY7Z08', 'CHCK5824C2VL', 'TRIKESEC-6CKHJC-927', '2028-08-14', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9143, 4409, 6543, 'BN-Z384-3A', 'DVA-7153', 'Bajaj RE Compact', 'Green', 'EN9JTIWX06Y', 'CHJDOEKNLHKU', 'TRIKESEC-YVGL4T-564', '2028-10-31', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9177, 5737, 8601, 'BN-K559-SU', 'RKP-5646', 'Bajaj RE Compact', 'Blue', 'EN679ZTH9M0', 'CHNISKN2ZV73', 'TRIKESEC-FB0NL0-333', '2028-07-17', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9341, 9469, 9370, 'BN-Q716-HZ', 'MNL-1957', 'Yamaha YTX 125', 'Yellow', 'ENBH86O224F', 'CH26A0597DKS', 'TRIKESEC-269LXH-802', '2026-10-05', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9358, 6921, 2822, 'BN-U360-BR', 'RKP-2959', 'Bajaj RE Compact', 'Red', 'ENROXC5SFSN', 'CHX3E3SPHD8X', 'TRIKESEC-XEI53O-686', '2026-03-09', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9522, 9388, 2463, 'BN-J844-KM', 'LPU-3211', 'Kymco Kargador 150', 'Yellow', 'EN8C6F8MFZ5', 'CHQ904ADJ4P3', 'TRIKESEC-HCB07O-663', '2028-02-26', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9782, 9781, 6794, 'BN-S703-L1', 'TSC-1518', 'Suzuki GD 110', 'Black', 'ENYK5D89POJ', 'CHKPGNY1N6I6', 'TRIKESEC-5EIQUX-647', '2028-11-11', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9883, 3605, 9370, 'BN-W143-GA', 'RKP-7920', 'Kawasaki Barako II', 'Red', 'ENTQCZB9NJA', 'CHB0QBHDNCND', 'TRIKESEC-GDHZCL-460', '2028-11-03', 'approved', '2026-05-03 15:23:22', '2026-05-03 15:23:22');

--
-- Triggers `tricycles`
--
DELIMITER $$
CREATE TRIGGER `trg_tricycles_before_insert` BEFORE INSERT ON `tricycles` FOR EACH ROW BEGIN
  DECLARE driver_membership_status VARCHAR(20);
  DECLARE driver_toda_id INT;

  SELECT `membership_status`, `toda_id`
    INTO driver_membership_status, driver_toda_id
  FROM `drivers`
  WHERE `driver_id` = NEW.`driver_id`
  LIMIT 1;

  IF driver_membership_status IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected driver profile does not exist.';
  END IF;

  IF driver_membership_status <> 'approved' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only approved TODA members can submit a tricycle for franchising.';
  END IF;

  IF driver_toda_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The driver must belong to an approved TODA before adding a tricycle.';
  END IF;

  IF NEW.`toda_id` IS NULL THEN
    SET NEW.`toda_id` = driver_toda_id;
  END IF;

  IF NEW.`toda_id` <> driver_toda_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The tricycle TODA must match the driver TODA membership.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_tricycles_before_update` BEFORE UPDATE ON `tricycles` FOR EACH ROW BEGIN
  DECLARE driver_membership_status VARCHAR(20);
  DECLARE driver_toda_id INT;

  SELECT `membership_status`, `toda_id`
    INTO driver_membership_status, driver_toda_id
  FROM `drivers`
  WHERE `driver_id` = NEW.`driver_id`
  LIMIT 1;

  IF driver_membership_status IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The selected driver profile does not exist.';
  END IF;

  IF driver_membership_status <> 'approved' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only approved TODA members can keep a tricycle record in the franchise flow.';
  END IF;

  IF driver_toda_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The driver must belong to an approved TODA before updating a tricycle.';
  END IF;

  IF NEW.`toda_id` IS NULL THEN
    SET NEW.`toda_id` = driver_toda_id;
  END IF;

  IF NEW.`toda_id` <> driver_toda_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The tricycle TODA must match the driver TODA membership.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `sex` enum('male','female','other') DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('lgu','driver','commuter') NOT NULL,
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `sex`, `weight`, `mobile_number`, `username`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1028, 'David Gludo', 'male', 66.13, '09136730749', 'davidgludo', 'davidgludo@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1140, 'Alyssa Ocampo', 'other', 83.49, '09433568382', 'aocampodrv343', 'alyssa.ocampodrv938@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1146, 'Rhea Fajardo', 'female', 91.57, '09205428641', 'rfajardodrv576', 'rhea.fajardodrv649@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1228, 'Clarisse Santos', 'female', 53.87, '09021450370', 'csantosdrv853', 'clarisse.santosdrv58@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1240, 'Jomar Pascual', 'female', 84.91, '09000138129', 'jpascualdrv368', 'jomar.pascualdrv651@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1242, 'Rhea Bernardo', 'male', 60.39, '09838627917', 'rbernardodrv810', 'rhea.bernardodrv732@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1297, 'Jomar Santos', 'female', 55.76, '09110525817', 'jsantoscom26', 'jomar.santoscom785@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1445, 'Joshua Tolentino', 'female', 64.81, '09533878599', 'jtolentinocom470', 'joshua.tolentinocom242@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1510, 'Katrina Fajardo', 'male', 54.08, '09715293297', 'kfajardolgu846', 'katrina.fajardolgu79@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1526, 'Princess Dela Cruz', 'female', 53.68, '09090537895', 'pdelacruzcom587', 'princess.delacruzcom479@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1538, 'David Alfred Gludo', 'male', 68.42, '09393614361', 'davidalfredgludo', 'davidalfredgludo@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1661, 'Kyla Soriano', 'female', 52.37, '09237321735', 'ksorianodrv367', 'kyla.sorianodrv871@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1717, 'Joel Fajardo', 'other', 69.79, '09901440309', 'jfajardodrv716', 'joel.fajardodrv541@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1730, 'Rafael Flores', 'male', 88.06, '09795575345', 'rfloresdrv223', 'rafael.floresdrv739@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1734, 'Dianne Aquino', 'female', 66.25, '09681236039', 'daquinodrv279', 'dianne.aquinodrv275@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(1757, 'Nestor Valdez', 'female', 55.31, '09879200300', 'nvaldezdrv695', 'nestor.valdezdrv819@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2004, 'Mylene Villanueva', 'other', 65.85, '09113102280', 'mvillanuevadri433', 'mylene.villanuevadri26@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2064, 'Gerald Dimaculangan', 'other', 90.92, '09480983257', 'gdimaculangandrv247', 'gerald.dimaculangandrv145@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2248, 'Edison Reyes', 'other', 64.57, '09714042767', 'ereyesdrv708', 'edison.reyesdrv430@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2354, 'Roderick Abad', 'other', 89.98, '09262609625', 'rabadcom936', 'roderick.abadcom399@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2394, 'Alyssa Ramos', 'female', 94.75, '09834783949', 'aramoscom246', 'alyssa.ramoscom700@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2409, 'Andrea Torres', 'female', 90.13, '09436374991', 'atorrescom341', 'andrea.torrescom475@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2447, 'Lourdes Escobar', 'male', 50.34, '09408302955', 'lescobarcom388', 'lourdes.escobarcom653@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2454, 'Trisha Gonzales', 'other', 74.39, '09956982503', 'tgonzalesdri522', 'trisha.gonzalesdri777@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2531, 'Nathaniel Galang', 'female', 65.70, '09038407857', 'ngalangcom162', 'nathaniel.galangcom583@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2606, 'Kenneth Cruz', 'female', 57.58, '09866802019', 'kcruzdrv725', 'kenneth.cruzdrv541@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2711, 'Renz Santos', 'male', 48.11, '09342929033', 'rsantosdrv430', 'renz.santosdrv465@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2882, 'Katrina Domingo', 'male', 79.06, '09035874595', 'kdomingocom836', 'katrina.domingocom179@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2913, 'Jennica Magbanua', 'female', 63.51, '09030653314', 'jmagbanuacom347', 'jennica.magbanuacom820@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2938, 'Hazel Magbanua', 'female', 87.76, '09387002601', 'hmagbanuacom825', 'hazel.magbanuacom920@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2956, 'Mark Mercado', 'male', 75.36, '09466750762', 'mmercadodri71', 'mark.mercadodri772@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(2981, 'Dianne Escobar', 'female', 62.90, '09594320341', 'descobarlgu439', 'dianne.escobarlgu995@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3032, 'Hazel Cruz', 'other', 60.81, '09865014548', 'hcruzlgu696', 'hazel.cruzlgu440@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3089, 'Lourdes Lazaro', 'male', 48.51, '09700983452', 'llazarodrv640', 'lourdes.lazarodrv339@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3599, 'David Gludo FTW', 'male', 70.55, '09988044932', 'davidgludoftw', 'davidgludoftw@gmail', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3658, 'Rafael Tiongson', 'male', 71.81, '09966249678', 'rtiongsondrv751', 'rafael.tiongsondrv212@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3824, 'Roderick Bautista', 'male', 59.75, '09137224765', 'rbautistadrv312', 'roderick.bautistadrv983@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(3834, 'Lovely Villanueva', 'female', 50.87, '09845655792', 'lvillanuevadrv698', 'lovely.villanuevadrv984@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4034, 'Dennis Tiongson', 'male', 59.02, '09296238550', 'dtiongsoncom104', 'dennis.tiongsoncom583@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4090, 'Marvin Castillo', 'male', 66.23, '09209587905', 'mcastillolgu713', 'marvin.castillolgu391@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4191, 'Hazel Pascual', 'female', 50.67, '09881444320', 'hpascualdrv203', 'hazel.pascualdrv469@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4346, 'Joel Rivera', 'male', 50.22, '09698902651', 'jriveradrv309', 'joel.riveradrv886@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4370, 'Marielle Castillo', 'female', 86.69, '09806864484', 'mcastillocom560', 'marielle.castillocom172@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4457, 'Jomar Del Rosario', 'female', 85.59, '09156739318', 'jdelrosariocom129', 'jomar.delrosariocom329@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4515, 'Daisy Magbanua', 'male', 67.81, '09621637867', 'dmagbanuacom549', 'daisy.magbanuacom423@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4598, 'Dennis Abad', 'female', 48.13, '09959573904', 'dabaddri439', 'dennis.abaddri838@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4635, 'Cristina Tiongson', 'other', 48.31, '09447433086', 'ctiongsondrv426', 'cristina.tiongsondrv855@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4668, 'Kenneth Escobar', 'other', 72.32, '09395538187', 'kescobardrv770', 'kenneth.escobardrv589@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4703, 'Mylene Abad', 'male', 79.99, '09483179748', 'mabaddrv693', 'mylene.abaddrv669@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4743, 'Faith Garcia', 'other', 74.68, '09202228770', 'fgarciadrv97', 'faith.garciadrv728@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4796, 'Patrick Tolentino', 'female', 69.46, '09008816007', 'ptolentinodrv518', 'patrick.tolentinodrv537@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4833, 'Joel Pascual', 'other', 60.34, '09260476138', 'jpascualdrv49', 'joel.pascualdrv23@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(4836, 'Faith Pascual', 'male', 55.49, '09471874979', 'fpascualdrv344', 'faith.pascualdrv668@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5070, 'Paolo Fajardo', 'male', 69.64, '09453938440', 'pfajardocom301', 'paolo.fajardocom997@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5100, 'Aldrin Escobar', 'other', 80.10, '09925525501', 'aescobarcom746', 'aldrin.escobarcom659@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5152, 'Carlito Torres', 'male', 80.58, '09775816395', 'ctorresdrv497', 'carlito.torresdrv638@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5292, 'Alvin Dela Cruz', 'male', 84.40, '09946773875', 'adelacruzdrv155', 'alvin.delacruzdrv381@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5351, 'Mikael Tiongson', 'other', 69.06, '09827477520', 'mtiongsondrv668', 'mikael.tiongsondrv724@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5536, 'Katrina Magbanua', 'male', 85.63, '09582616472', 'kmagbanuacom862', 'katrina.magbanuacom46@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(5843, 'Faith Tiongson', 'male', 57.01, '09385997013', 'ftiongsondrv743', 'faith.tiongsondrv358@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6299, 'Rhea Garcia', 'other', 77.79, '09844387820', 'rgarciadrv393', 'rhea.garciadrv232@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6493, 'Cristina Tolentino', 'female', 76.67, '09968764147', 'ctolentinodri688', 'cristina.tolentinodri498@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6552, 'Renz Pascual', 'male', 51.93, '09180903607', 'rpascualcom722', 'renz.pascualcom631@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6616, 'Ronnie Galang', 'female', 64.69, '09941668727', 'rgalangcom820', 'ronnie.galangcom316@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6743, 'Elaine Ocampo', 'male', 69.27, '09735522981', 'eocampodrv435', 'elaine.ocampodrv487@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6791, 'Kyla Austria', 'female', 69.25, '09922334446', 'kaustriadrv968', 'kyla.austriadrv598@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6799, 'Princess Ocampo', 'female', 49.56, '09664093279', 'pocampodrv799', 'princess.ocampodrv550@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6908, 'Ivy Navarro', 'female', 74.87, '09627536290', 'inavarrodrv475', 'ivy.navarrodrv768@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6929, 'Edison Garcia', 'other', 82.14, '09210443592', 'egarciadrv682', 'edison.garciadrv764@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(6966, 'Cristina Salazar', 'male', 77.90, '09823077021', 'csalazarcom218', 'cristina.salazarcom674@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7041, 'Jessa Panganiban', 'female', 89.34, '09225315529', 'jpanganibancom224', 'jessa.panganibancom812@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7063, 'Angela Galang', 'other', 76.18, '09407493856', 'agalangcom719', 'angela.galangcom35@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7326, 'Mikael Gonzales', 'other', 90.69, '09929647250', 'mgonzalesdrv796', 'mikael.gonzalesdrv40@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7362, 'Daisy Castillo', 'other', 55.18, '09091666710', 'dcastillodrv428', 'daisy.castillodrv286@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7421, 'Mylene Flores', 'other', 75.93, '09652590921', 'mfloresdrv433', 'mylene.floresdrv944@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7506, 'Jomar Flores', 'female', 75.41, '09921670446', 'jflorescom390', 'jomar.florescom992@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7527, 'Jomar Cruz', 'male', 94.61, '09914653690', 'jcruzcom825', 'jomar.cruzcom863@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7669, 'Lara Valdez', 'other', 73.31, '09569080468', 'lvaldezcom256', 'lara.valdezcom496@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(7792, 'Angela Aguilar', 'other', 67.80, '09132547671', 'aaguilardrv100', 'angela.aguilardrv738@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8005, 'Patrick Del Rosario', 'female', 67.19, '09660982324', 'pdelrosariodri852', 'patrick.delrosariodri251@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8208, 'Alyssa Cruz', 'female', 58.42, '09207250338', 'acruzdrv421', 'alyssa.cruzdrv570@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8578, 'Edison Flores', 'other', 68.23, '09484292007', 'efloreslgu457', 'edison.floreslgu969@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'lgu', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8600, 'Bryan Salazar', 'other', 47.76, '09422846704', 'bsalazardri568', 'bryan.salazardri439@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8605, 'Cedric Castillo', 'male', 49.36, '09021782885', 'ccastillocom99', 'cedric.castillocom947@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8624, 'Alvin Ocampo', 'other', 53.63, '09954469734', 'aocampocom236', 'alvin.ocampocom961@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8637, 'Jennica Cruz', 'other', 67.31, '09393780518', 'jcruzcom362', 'jennica.cruzcom317@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8649, 'Vincent Reyes', 'female', 87.41, '09355803684', 'vreyesdri529', 'vincent.reyesdri260@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8675, 'Arvin Rosales', 'male', 53.49, '09212105549', 'arosalescom794', 'arvin.rosalescom666@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8877, 'Angela Cruz', 'female', 71.15, '09167983102', 'acruzdrv407', 'angela.cruzdrv859@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8904, 'Gerald Ocampo', 'other', 60.22, '09424318695', 'gocampodrv861', 'gerald.ocampodrv619@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(8956, 'Hazel Pascual', 'other', 50.13, '09584418751', 'hpascualdrv175', 'hazel.pascualdrv997@yahoo.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9122, 'Faith Macaraig', 'female', 82.13, '09593107729', 'fmacaraigcom804', 'faith.macaraigcom706@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9149, 'Andrea Salazar', 'other', 86.96, '09883074037', 'asalazardri231', 'andrea.salazardri903@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9270, 'Vincent Ramos', 'female', 55.53, '09903697105', 'vramosdrv628', 'vincent.ramosdrv394@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9364, 'Lourdes Galang', 'male', 69.88, '09480323946', 'lgalangdrv886', 'lourdes.galangdrv282@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9653, 'Nicole Dela Cruz', 'female', 80.75, '09378763790', 'ndelacruzcom168', 'nicole.delacruzcom54@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9658, 'Jericho Macaraig', 'male', 59.67, '09069992226', 'jmacaraigcom833', 'jericho.macaraigcom983@mail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'commuter', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9664, 'Gerald Magbanua', 'other', 94.03, '09196640697', 'gmagbanuadri81', 'gerald.magbanuadri431@gmail.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'suspended', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9918, 'Cedric Aquino', 'other', 64.16, '09860647255', 'caquinodrv638', 'cedric.aquinodrv874@example.net', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22'),
(9932, 'Marvin Dela Cruz', 'female', 72.41, '09395764145', 'mdelacruzdrv148', 'marvin.delacruzdrv318@outlook.com', '$2b$12$Ku/DdQC1gh2HtATIjE8yp.OIU9syjm5B07fTSUdVDfgzCQ2m/hwH.', 'driver', 'active', '2026-05-03 15:23:22', '2026-05-03 15:23:22');

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
('038ec7692dcdc26b35fcf189dcbd42c9f1685e60b82bb705', 1787234882, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":1240}'),
('04d644f7c6d413e50ab28c143c78cb9be0ef896018b860f4', 1791916791, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":4457}'),
('04dd2b025fac2b85ff2c4bb436227954f1c8f3c5a090463f', 1796967974, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":3658}'),
('06526b39f93fcef00956a43d4949a78603e6f6cbdeda8938', 1787717165, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":4836}'),
('08b10555571955ba873e7e876cca2d4e20282ffc399ad015', 1787118183, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":2354}'),
('08ba7c6ab8c8d92c648208d796c127774890e604475223f0', 1789100505, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":4515}'),
('1418d2d1d61624a616477e03da5f615f0f0c4bd830c81e40', 1796542014, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":6966}'),
('14ce94c2d9fa343d0c04af5b21efbb345660fb39cd7f19b4', 1780680203, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":6743}'),
('212f649baec80307b342f7aa21e98a7f01ba7f866d4922ed', 1789352170, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":4191}'),
('260cde045ad61afd0a6858ca9fcb9b555b6debd9d8e88882', 1794024215, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":1510}'),
('296c89f82b3d73f444d3a59091a1685f458a9e6559a47269', 1786075539, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":3834}'),
('29fdcbdfe05708a6d5c01d46f7cac7d7ecf8b1be483d1859', 1795423808, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":2711}'),
('2bae16d67fb0ec17444571c5813c4d08824c2f21710991a7', 1789583877, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":3658}'),
('2c8b0ff09709fb654254aff8a5919914591f099f4225b072', 1787945302, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":6616}'),
('31f72df94ec50e51b87e2573353fdacc97db10472b8aa912', 1778742621, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":1146}'),
('36178e9e9992de1e8f7d514b4f4635373fb8d6c62adbc09a', 1794139040, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":4743}'),
('40bd9d9257faa8c54969223f49d4a02465e538a2d04ae0ed', 1789147819, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":3824}'),
('41b6bcd1f9d9abaeb3d755d112eec982bd041e61c7a78276', 1780064482, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":8675}'),
('4fa09532348f9a382b6656fcc21485ce5f67a6ac514992cc', 1781914068, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":1757}'),
('4fbe844bb3fe6e817879d8ba1b20d1345eba38d41adf88f2', 1796547255, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":9653}'),
('5694f6c4a9d1e561ef75663720d0350bda8af80e62b26ddf', 1795224025, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":2938}'),
('7660d4dc1fd7fe37e73af613602c6370916b4b6ce6bba94f', 1791965847, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":4598}'),
('76fcdf85922a1fcc0a60216ba7063ef4ef517875439f206a', 1798765822, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":1228}'),
('7da6c006de9ffacaee77059a3b9829a945e3e9536e615923', 1779246177, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":2711}'),
('8793a26ded518e65b6deda547b77b91a366e9bef75813be4', 1791870267, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":3089}'),
('8b49ab613df3a0461c5bc84328d7a7d3d916102f33623d65', 1788801528, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":8649}'),
('8d2ecfdeb82790854060ccbc587220f2add283f513acc130', 1795170740, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":7362}'),
('9033f0b9279794921398a229d6af6bbed5f9dfd69a57cf8b', 1792211295, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":5292}'),
('912fd71f28e8d6ec971258a7307fef2643e3afa0fddefc07', 1797285134, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":1242}'),
('914dc5cb963721555626ec188d669d92e7d9cd5ede57a253', 1785667737, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":4191}'),
('92764f7b42db163c1db7aee7414c9595c60b1972b3518c17', 1788426185, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":2956}'),
('9841171db4e789936af0de26a355962dad018fff59e1fda6', 1797508427, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":4796}'),
('9941ccc533a750f808d05dc5dd7c55bbf24a400062192281', 1794682998, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":9932}'),
('a58bd0d1b377f03029b6e9b0a756131c1493daecb237c4a4', 1788064011, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":9149}'),
('ac71eb762ffbf555ebe88f979a1a3075b6180af14a6a91de', 1789459340, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":6493}'),
('b63dec97c0467a2a7bf4ba3eb715e3af9fff404750eb6a78', 1788794319, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":7506}'),
('c0fe07fbd415d8abaa57b35a67cc4161f3fff61f714923fe', 1777403261, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":4034}'),
('ccd5bbf083d9bab0ff7a18d87c302c5a4abddba63a629b0a', 1786701141, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":4833}'),
('cd3e009a4dcaf05339b2eedb106fe577c0077260edc64a76', 1795254499, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":1242}'),
('cd83f30b18c49ceb85ec63e77b0af948b22c04c7040587bf', 1784041314, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":4191}'),
('d2fbeaffe1d06b179e3415a9600b2a900a32f43d4ae726b4', 1788050739, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":1242}'),
('d310268db197de90e5397529f179c630a46d67aeb1d6e20a', 1787801520, '{\"cookie\":{\"originalMaxAge\":7200000},\"userId\":6908}'),
('dab0decbe2edc18fac18d719a7afcacb885e0e9cdbae9b61', 1790555512, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":3032}'),
('dc51fab5d2c89057506723e6be69ef900b82e4ea361f05f2', 1786104584, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":6929}'),
('dd6560398b649db43539d1fa3dbe0fd531cfc4b322c40357', 1797832868, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":6929}'),
('e35b8cc919b52b64a8d24478a62baeffe094d5f0803471d4', 1781301773, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":8208}'),
('ec060a5ca77340032dcee85f4bea2cce0ed2e5e706978fa3', 1792205574, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":8956}'),
('ee15be16ec23028e2ffe13d6d87d83926192765c7716c87c', 1790214091, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":3834}'),
('f947a072df1606ce09d57405006ad935428e77a9bb1970b1', 1796644099, '{\"cookie\":{\"originalMaxAge\":3600000},\"userId\":5152}'),
('ff1964baa90218544e0a029c289d02782046ff1d13bc14c3', 1781092655, '{\"cookie\":{\"originalMaxAge\":86400000},\"userId\":8208}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `idx_complaints_tricycle` (`tricycle_id`),
  ADD KEY `idx_complaints_driver` (`driver_id`),
  ADD KEY `idx_complaints_commuter` (`commuter_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `uq_drivers_user_id` (`user_id`),
  ADD UNIQUE KEY `uq_drivers_license_number` (`license_number`),
  ADD KEY `idx_drivers_toda_status` (`toda_id`,`membership_status`),
  ADD KEY `idx_drivers_membership_role` (`membership_role`),
  ADD KEY `idx_drivers_reviewed_by` (`membership_reviewed_by_user_id`);

--
-- Indexes for table `franchises`
--
ALTER TABLE `franchises`
  ADD PRIMARY KEY (`franchise_id`),
  ADD KEY `idx_franchises_status` (`status`),
  ADD KEY `idx_franchises_tricycle_status` (`tricycle_id`,`status`),
  ADD KEY `idx_franchises_reviewed_by` (`reviewed_by_user_id`);

--
-- Indexes for table `ride_requests`
--
ALTER TABLE `ride_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_ride_requests_status` (`status`),
  ADD KEY `idx_ride_requests_commuter` (`commuter_id`),
  ADD KEY `idx_ride_requests_driver` (`assigned_driver_id`);

--
-- Indexes for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  ADD PRIMARY KEY (`alert_id`),
  ADD KEY `idx_sos_alerts_user` (`user_id`);

--
-- Indexes for table `todas`
--
ALTER TABLE `todas`
  ADD PRIMARY KEY (`toda_id`),
  ADD UNIQUE KEY `uq_todas_name` (`toda_name`),
  ADD UNIQUE KEY `uq_todas_code` (`toda_code`),
  ADD KEY `idx_todas_status` (`status`),
  ADD KEY `idx_todas_president` (`president_user_id`),
  ADD KEY `idx_todas_reviewed_by` (`reviewed_by_user_id`);

--
-- Indexes for table `tricycles`
--
ALTER TABLE `tricycles`
  ADD PRIMARY KEY (`tricycle_id`),
  ADD UNIQUE KEY `uq_tricycles_plate_number` (`plate_number`),
  ADD UNIQUE KEY `uq_tricycles_body_number` (`body_number`),
  ADD UNIQUE KEY `uq_tricycles_qr_code_value` (`qr_code_value`),
  ADD KEY `idx_tricycles_driver_status` (`driver_id`,`status`),
  ADD KEY `idx_tricycles_toda` (`toda_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_username` (`username`),
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
  MODIFY `complaint_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9877;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9817;

--
-- AUTO_INCREMENT for table `franchises`
--
ALTER TABLE `franchises`
  MODIFY `franchise_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9748;

--
-- AUTO_INCREMENT for table `ride_requests`
--
ALTER TABLE `ride_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9950;

--
-- AUTO_INCREMENT for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  MODIFY `alert_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9997;

--
-- AUTO_INCREMENT for table `todas`
--
ALTER TABLE `todas`
  MODIFY `toda_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9912;

--
-- AUTO_INCREMENT for table `tricycles`
--
ALTER TABLE `tricycles`
  MODIFY `tricycle_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9884;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9933;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaints_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`),
  ADD CONSTRAINT `fk_complaints_tricycle` FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`);

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `fk_drivers_reviewed_by` FOREIGN KEY (`membership_reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_drivers_toda` FOREIGN KEY (`toda_id`) REFERENCES `todas` (`toda_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_drivers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `franchises`
--
ALTER TABLE `franchises`
  ADD CONSTRAINT `fk_franchises_reviewed_by` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_franchises_tricycle` FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`) ON DELETE CASCADE;

--
-- Constraints for table `ride_requests`
--
ALTER TABLE `ride_requests`
  ADD CONSTRAINT `fk_ride_requests_commuter` FOREIGN KEY (`commuter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ride_requests_driver` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`driver_id`);

--
-- Constraints for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  ADD CONSTRAINT `fk_sos_alerts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `todas`
--
ALTER TABLE `todas`
  ADD CONSTRAINT `fk_todas_president_user` FOREIGN KEY (`president_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_todas_reviewed_by` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tricycles`
--
ALTER TABLE `tricycles`
  ADD CONSTRAINT `fk_tricycles_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tricycles_toda` FOREIGN KEY (`toda_id`) REFERENCES `todas` (`toda_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
