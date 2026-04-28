-- Updated TrikeSecure SQL import
-- Models TODA creation, driver membership, and franchise application flow.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `trikesec`;
USE `trikesec`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `franchises`;
DROP TABLE IF EXISTS `tricycles`;
DROP TABLE IF EXISTS `ride_requests`;
DROP TABLE IF EXISTS `sos_alerts`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `todas`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

DROP TRIGGER IF EXISTS `trg_todas_before_insert`;
DROP TRIGGER IF EXISTS `trg_todas_before_update`;
DROP TRIGGER IF EXISTS `trg_drivers_before_insert`;
DROP TRIGGER IF EXISTS `trg_drivers_before_update`;
DROP TRIGGER IF EXISTS `trg_tricycles_before_insert`;
DROP TRIGGER IF EXISTS `trg_tricycles_before_update`;
DROP TRIGGER IF EXISTS `trg_franchises_before_insert`;
DROP TRIGGER IF EXISTS `trg_franchises_before_update`;
DROP TRIGGER IF EXISTS `trg_franchises_after_insert`;
DROP TRIGGER IF EXISTS `trg_franchises_after_update`;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('lgu','driver','commuter') NOT NULL,
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `todas` (
  `toda_id` int NOT NULL AUTO_INCREMENT,
  `toda_name` varchar(150) NOT NULL,
  `toda_code` varchar(50) DEFAULT NULL,
  `president_user_id` int NOT NULL,
  `barangay` varchar(150) NOT NULL,
  `municipality` varchar(150) DEFAULT NULL,
  `route_description` text NOT NULL,
  `letter_of_intent_document` varchar(255) NOT NULL,
  `officers_list_document` varchar(255) NOT NULL,
  `members_list_document` varchar(255) DEFAULT NULL,
  `barangay_approval_document` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected','inactive') NOT NULL DEFAULT 'pending',
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_user_id` int DEFAULT NULL,
  `review_remarks` text,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`toda_id`),
  UNIQUE KEY `uq_todas_name` (`toda_name`),
  UNIQUE KEY `uq_todas_code` (`toda_code`),
  KEY `idx_todas_status` (`status`),
  KEY `idx_todas_president` (`president_user_id`),
  KEY `idx_todas_reviewed_by` (`reviewed_by_user_id`),
  CONSTRAINT `fk_todas_president_user`
    FOREIGN KEY (`president_user_id`) REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT,
  CONSTRAINT `fk_todas_reviewed_by`
    FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`),
  UNIQUE KEY `uq_drivers_user_id` (`user_id`),
  UNIQUE KEY `uq_drivers_license_number` (`license_number`),
  KEY `idx_drivers_toda_status` (`toda_id`,`membership_status`),
  KEY `idx_drivers_membership_role` (`membership_role`),
  KEY `idx_drivers_reviewed_by` (`membership_reviewed_by_user_id`),
  CONSTRAINT `fk_drivers_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_drivers_toda`
    FOREIGN KEY (`toda_id`) REFERENCES `todas` (`toda_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_drivers_reviewed_by`
    FOREIGN KEY (`membership_reviewed_by_user_id`) REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tricycles` (
  `tricycle_id` int NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tricycle_id`),
  UNIQUE KEY `uq_tricycles_body_number` (`body_number`),
  UNIQUE KEY `uq_tricycles_plate_number` (`plate_number`),
  UNIQUE KEY `uq_tricycles_qr_code_value` (`qr_code_value`),
  KEY `idx_tricycles_driver_status` (`driver_id`,`status`),
  KEY `idx_tricycles_toda` (`toda_id`),
  CONSTRAINT `fk_tricycles_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tricycles_toda`
    FOREIGN KEY (`toda_id`) REFERENCES `todas` (`toda_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `franchises` (
  `franchise_id` int NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`franchise_id`),
  KEY `idx_franchises_status` (`status`),
  KEY `idx_franchises_tricycle_status` (`tricycle_id`,`status`),
  KEY `idx_franchises_reviewed_by` (`reviewed_by_user_id`),
  CONSTRAINT `fk_franchises_tricycle`
    FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_franchises_reviewed_by`
    FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `tricycle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `complaint_type` varchar(100) DEFAULT NULL,
  `description` text,
  `date_reported` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','resolved') DEFAULT 'pending',
  PRIMARY KEY (`complaint_id`),
  KEY `idx_complaints_tricycle` (`tricycle_id`),
  KEY `idx_complaints_driver` (`driver_id`),
  CONSTRAINT `fk_complaints_tricycle`
    FOREIGN KEY (`tricycle_id`) REFERENCES `tricycles` (`tricycle_id`),
  CONSTRAINT `fk_complaints_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ride_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
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
  `status` enum('waiting','accepted','arrived','in_progress','completed','cancelled') DEFAULT 'waiting',
  PRIMARY KEY (`request_id`),
  KEY `idx_ride_requests_status` (`status`),
  KEY `idx_ride_requests_commuter` (`commuter_id`),
  KEY `idx_ride_requests_driver` (`assigned_driver_id`),
  CONSTRAINT `fk_ride_requests_commuter`
    FOREIGN KEY (`commuter_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_ride_requests_driver`
    FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sos_alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_role` enum('commuter','driver') NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `ride_id` int DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','resolved') DEFAULT 'active',
  PRIMARY KEY (`alert_id`),
  KEY `idx_sos_alerts_user` (`user_id`),
  CONSTRAINT `fk_sos_alerts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELIMITER $$

CREATE TRIGGER `trg_todas_before_insert`
BEFORE INSERT ON `todas`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_todas_before_update`
BEFORE UPDATE ON `todas`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_drivers_before_insert`
BEFORE INSERT ON `drivers`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_drivers_before_update`
BEFORE UPDATE ON `drivers`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_tricycles_before_insert`
BEFORE INSERT ON `tricycles`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_tricycles_before_update`
BEFORE UPDATE ON `tricycles`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_franchises_before_insert`
BEFORE INSERT ON `franchises`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_franchises_before_update`
BEFORE UPDATE ON `franchises`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_franchises_after_insert`
AFTER INSERT ON `franchises`
FOR EACH ROW
BEGIN
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
END$$

CREATE TRIGGER `trg_franchises_after_update`
AFTER UPDATE ON `franchises`
FOR EACH ROW
BEGIN
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
END$$

DELIMITER ;

COMMIT;
