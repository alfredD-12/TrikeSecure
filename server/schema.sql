-- Run this SQL in your MySQL database to set up the TODA schema

CREATE DATABASE IF NOT EXISTS trikesec;
USE trikesec;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','officer','driver','commuter') NOT NULL,
  status ENUM('active','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backward-compatible migration for older MySQL versions (no ADD COLUMN IF NOT EXISTS support)
SET @email_column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email'
);

SET @add_email_sql := IF(
  @email_column_exists = 0,
  'ALTER TABLE users ADD COLUMN email VARCHAR(150) NULL AFTER username',
  'SELECT 1'
);

PREPARE add_email_stmt FROM @add_email_sql;
EXECUTE add_email_stmt;
DEALLOCATE PREPARE add_email_stmt;

SET @email_unique_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'uq_users_email'
);

SET @add_email_unique_sql := IF(
  @email_unique_exists = 0,
  'ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email)',
  'SELECT 1'
);

PREPARE add_email_unique_stmt FROM @add_email_unique_sql;
EXECUTE add_email_unique_stmt;
DEALLOCATE PREPARE add_email_unique_stmt;

CREATE TABLE IF NOT EXISTS drivers (
  driver_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  toda_name VARCHAR(100),
  status ENUM('active','suspended','expired') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tricycles (
  tricycle_id INT AUTO_INCREMENT PRIMARY KEY,
  body_number VARCHAR(50) NOT NULL UNIQUE,
  plate_number VARCHAR(50),
  driver_id INT NOT NULL,
  toda_name VARCHAR(100),
  franchise_expiry DATE,
  qr_code_value VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('active','expired','suspended') DEFAULT 'active',
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS franchises (
  franchise_id INT AUTO_INCREMENT PRIMARY KEY,
  tricycle_id INT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  lgu_reference_no VARCHAR(100),
  FOREIGN KEY (tricycle_id) REFERENCES tricycles(tricycle_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  tricycle_id INT NOT NULL,
  driver_id INT NOT NULL,
  complaint_type VARCHAR(100),
  description TEXT,
  date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','resolved') DEFAULT 'pending',
  FOREIGN KEY (tricycle_id) REFERENCES tricycles(tricycle_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
);

CREATE TABLE IF NOT EXISTS ride_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  pickup_location VARCHAR(255) NOT NULL,
  request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_driver_id INT,
  status ENUM('waiting','accepted','completed','cancelled') DEFAULT 'waiting',
  FOREIGN KEY (assigned_driver_id) REFERENCES drivers(driver_id)
);
