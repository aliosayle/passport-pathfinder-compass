-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: passport_management
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `airlines`
--

DROP TABLE IF EXISTS `airlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airlines` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(3) NOT NULL,
  `contact_info` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airlines`
--

LOCK TABLES `airlines` WRITE;
/*!40000 ALTER TABLE `airlines` DISABLE KEYS */;
INSERT INTO `airlines` VALUES ('AL0bbdb8f4','Middle East Airlines','MEA',NULL),('AL5bbb2060','Ethiopian Airlines','ETH',NULL);
/*!40000 ALTER TABLE `airlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_visas`
--

DROP TABLE IF EXISTS `employee_visas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_visas` (
  `id` varchar(36) NOT NULL,
  `visa_type_id` varchar(36) NOT NULL,
  `employee_id` varchar(10) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `status` enum('Valid','Expired','Cancelled','Processing') NOT NULL DEFAULT 'Valid',
  `document_number` varchar(50) DEFAULT NULL,
  `notes` text,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `visa_type_id` (`visa_type_id`),
  KEY `expiry_date` (`expiry_date`),
  KEY `status` (`status`),
  CONSTRAINT `employee_visas_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_visas_ibfk_2` FOREIGN KEY (`visa_type_id`) REFERENCES `visa_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_visas`
--

LOCK TABLES `employee_visas` WRITE;
/*!40000 ALTER TABLE `employee_visas` DISABLE KEYS */;
INSERT INTO `employee_visas` VALUES ('d66fd0bc-04ef-4633-b8f5-61c1d8d34570','bb3c4efc-58c9-4f5f-8dc9-fd4063003173','EMP4728','Ali Osseili','2025-03-12','2025-04-11','Valid','LHY634848','','2025-05-08 12:16:05');
/*!40000 ALTER TABLE `employee_visas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `passport_id` varchar(20) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('EMP001','John Doe','IT','Developer','john.doe@example.com','+123456789','American',NULL,'2023-01-15',NULL),('EMP4728','Ali Osseili','IT','Developer','osseiliali7@gmail.com','76313174','Lebanese',NULL,'2024-10-24','asgrwraqtgaq'),('EMP6544','Pepe','IT','Technician','pepe@pepe.pepe','65468464','Congolese',NULL,'2024-06-05','');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flights`
--

DROP TABLE IF EXISTS `flights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flights` (
  `id` varchar(20) NOT NULL,
  `ticket_id` varchar(36) DEFAULT NULL,
  `employee_name` varchar(100) DEFAULT NULL,
  `employee_id` varchar(10) NOT NULL,
  `departure_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `destination` varchar(100) NOT NULL,
  `origin` varchar(100) NOT NULL,
  `airline_id` varchar(36) DEFAULT NULL,
  `airline_name` varchar(100) DEFAULT NULL,
  `ticket_reference` varchar(20) NOT NULL,
  `flight_number` varchar(20) DEFAULT NULL,
  `is_return` tinyint(1) DEFAULT '0',
  `status` enum('Pending','Completed','Cancelled','Delayed') NOT NULL,
  `type` enum('Business','Vacation','Sick Leave','Family Emergency','Training') NOT NULL,
  `notes` text,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `booking_reference` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `airline_id` (`airline_id`),
  KEY `idx_departure` (`departure_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `flights_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `flights_ibfk_2` FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flights`
--

LOCK TABLES `flights` WRITE;
/*!40000 ALTER TABLE `flights` DISABLE KEYS */;
INSERT INTO `flights` VALUES ('FL28b28962','c5fbd3fc-5926-4ac6-8654-fcd7652165c2','John Doe','EMP001','2025-05-05',NULL,'asedtg','asdg','AL0bbdb8f4','Middle East Airlines','asdfg','wew',0,'Pending','Business','Created from ticket asdfg','2025-05-05 08:31:17',NULL),('FL40fe7ba0',NULL,NULL,'EMP001','2025-05-05','2025-05-26','rasas','adsfg','AL0bbdb8f4',NULL,'aetgas','agers',0,'Pending','Business',NULL,'2025-05-03 11:53:35',NULL),('FL49bb6756','c5fbd3fc-5926-4ac6-8654-fcd7652165c2','John Doe','EMP001','2025-05-05',NULL,'asedtg','asdg','AL0bbdb8f4','Middle East Airlines','asdfg','wew',0,'Pending','Business','Created from ticket asdfg','2025-05-05 08:32:55',NULL),('FL5f4889ad',NULL,NULL,'EMP4728','2025-05-05','2025-05-12','gag','asdf','AL5bbb2060',NULL,'asdf','gased',0,'Pending','Business',NULL,'2025-05-03 11:43:17',NULL),('FLa4dcc8b1','9d31e2c3-78ac-4086-a884-c3eabdfcbbcc','John Doe','EMP001','2025-05-07',NULL,'NYC','KIN','AL0bbdb8f4','Middle East Airlines','TKT9121239685','ME3902',0,'Completed','Family Emergency','Created from ticket TKT9121239685','2025-05-06 12:17:11',NULL),('FLc0f33e66','c8a93a75-958b-4978-8a18-6a11c5c1bf01','Ali Osseili','EMP4728','2025-05-06',NULL,'BEI','KIN','AL0bbdb8f4','Middle East Airlines','TKT0456089813',NULL,0,'Cancelled','Vacation','Created from ticket TKT0456089813','2025-05-06 12:23:18',NULL),('FLcc1bd44e','c5fbd3fc-5926-4ac6-8654-fcd7652165c2','John Doe','EMP001','2025-05-05',NULL,'asedtg','asdg','AL0bbdb8f4','Middle East Airlines','asdfg','wew',0,'Pending','Business','Created from ticket asdfg','2025-05-05 08:31:38',NULL);
/*!40000 ALTER TABLE `flights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `money_transfers`
--

DROP TABLE IF EXISTS `money_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_transfers` (
  `id` varchar(50) NOT NULL,
  `employee_id` varchar(10) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `beneficiary_name` varchar(100) NOT NULL,
  `beneficiary_phone` varchar(20) NOT NULL,
  `notes` text,
  `status` enum('Pending','Completed','Failed') NOT NULL,
  `date` timestamp NOT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `money_transfers_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `money_transfers`
--

LOCK TABLES `money_transfers` WRITE;
/*!40000 ALTER TABLE `money_transfers` DISABLE KEYS */;
INSERT INTO `money_transfers` VALUES ('048e6a12-c589-44cf-9624-b55c2b3061c2','EMP001','John Doe',100.00,'USD','Lebanon','Osseili','065464564','','Pending','2025-05-05 09:28:54','2025-05-05 09:28:54'),('6878c291-7f88-4f60-91e8-8484dc424fda','EMP4728','Ali Osseili',5000.00,'USD','Leb','Osseili','03469793','testing note\n','Pending','2025-05-07 07:38:58','2025-05-07 07:38:58'),('8f3c0f33-cb85-49a2-b443-895e902215bd','EMP4728','Ali Osseili',250.00,'USD','Lebanon','Osseili','936176313174','This is a test\n','Pending','2025-05-05 12:59:06','2025-05-05 12:59:06');
/*!40000 ALTER TABLE `money_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nationalities`
--

DROP TABLE IF EXISTS `nationalities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nationalities` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` char(2) NOT NULL,
  `visa_requirements` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nationalities`
--

LOCK TABLES `nationalities` WRITE;
/*!40000 ALTER TABLE `nationalities` DISABLE KEYS */;
INSERT INTO `nationalities` VALUES ('NAT001','United States','US',NULL),('NAT049920','Congo','DR',NULL),('NAT202070','Lebanon','LB',NULL);
/*!40000 ALTER TABLE `nationalities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passports`
--

DROP TABLE IF EXISTS `passports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passports` (
  `id` varchar(20) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `employee_id` varchar(10) NOT NULL,
  `passport_number` varchar(20) NOT NULL,
  `nationality` varchar(50) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `status` enum('With Company','With Employee','With DGM') NOT NULL,
  `ticket_reference` varchar(20) DEFAULT NULL,
  `notes` text,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `idx_expiry` (`expiry_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `passports_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passports`
--

LOCK TABLES `passports` WRITE;
/*!40000 ALTER TABLE `passports` DISABLE KEYS */;
INSERT INTO `passports` VALUES ('P1746196097776','Ali Osseili','EMP4728','00069478948','Lebanon','2025-04-28','2025-05-31','With Company','6879684','TEST','2025-05-03 13:15:18'),('P1746197346813','John Doe','EMP001','006548941894','United States','2024-06-03','2025-11-13','With DGM','foihfg','','2025-05-02 14:49:06');
/*!40000 ALTER TABLE `passports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` varchar(50) NOT NULL,
  `reference` varchar(20) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `employee_id` varchar(10) NOT NULL,
  `issue_date` date NOT NULL,
  `airline_id` varchar(10) NOT NULL,
  `airline_name` varchar(100) NOT NULL,
  `flight_number` varchar(20) DEFAULT NULL,
  `departure_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `destination` varchar(100) NOT NULL,
  `origin` varchar(100) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `type` varchar(50) DEFAULT 'Business',
  `has_return` tinyint(1) DEFAULT '0',
  `departure_completed` tinyint(1) DEFAULT '0',
  `return_completed` tinyint(1) DEFAULT '0',
  `notes` text,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `departure_flight_id` varchar(50) DEFAULT NULL,
  `return_flight_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `employee_id` (`employee_id`),
  KEY `airline_id` (`airline_id`),
  KEY `idx_reference` (`reference`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES ('9d31e2c3-78ac-4086-a884-c3eabdfcbbcc','TKT9121239685','John Doe','EMP001','2025-05-06','AL0bbdb8f4','Middle East Airlines','ME3902','2025-05-07',NULL,'NYC','KIN',NULL,'USD','Completed','Family Emergency',0,1,0,NULL,'2025-05-06 12:08:32','FLa4dcc8b1',NULL),('c5fbd3fc-5926-4ac6-8654-fcd7652165c2','asdfg','John Doe','EMP001','2025-05-05','AL0bbdb8f4','Middle East Airlines','wew','2025-05-05','2025-05-28','asedtg','asdg',NULL,'USD','Completed','Business',1,1,1,NULL,'2025-05-05 08:33:26','FL49bb6756','FL58afb3d9'),('c8a93a75-958b-4978-8a18-6a11c5c1bf01','TKT0456089813','Ali Osseili','EMP4728','2025-05-06','AL0bbdb8f4','Middle East Airlines',NULL,'2025-05-06','2025-06-18','BEI','KIN',NULL,'USD','Active','Vacation',1,1,0,NULL,'2025-05-06 11:55:01','FLc0f33e66',NULL),('TK427cc051','asdf','Ali Osseili','EMP4728','2025-05-03','AL5bbb2060','Ethiopian Airlines','gased','2025-05-06','2025-05-13','gag','asdf',NULL,'USD','Active','Business',0,0,0,NULL,'2025-05-03 11:40:34',NULL,NULL),('TKf6e4d770','aetgas','John Doe','EMP001','2025-05-03','AL0bbdb8f4','Middle East Airlines','agers','2025-05-06','2025-05-27','rasas','adsfg',NULL,'USD','Active','Business',0,0,0,NULL,'2025-05-03 11:50:43',NULL,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploads`
--

DROP TABLE IF EXISTS `uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploads` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `upload_date` datetime NOT NULL,
  `last_accessed` datetime DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploads`
--

LOCK TABLES `uploads` WRITE;
/*!40000 ALTER TABLE `uploads` DISABLE KEYS */;
INSERT INTO `uploads` VALUES ('120bc881-a3ca-4cd2-b2e6-495818cc8b38','USER100001','9337ccbe-8e9b-4a4b-b243-7ccb6bc41989.png','20250430_1447_Giant Smurf, Mini Gargamels_simple_compose_01jt3f4ws9f7vat7bv7ywfk66j.png','uploads\\9337ccbe-8e9b-4a4b-b243-7ccb6bc41989.png',3111248,'image/png','2025-05-06 07:07:46','2025-05-06 07:08:09','Test item\n','EMP4728');
/*!40000 ALTER TABLE `uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'User',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `check_role` CHECK ((`role` in (_cp850'Admin',_cp850'User',_cp850'HR',_cp850'Travel')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('USER100001','admin','$2b$10$OCZLfiAdXLH0dKk/5Kz3neE8t1qMUUoN1Hf4Hd13mFh5uk5EYaVC6','admin@example.com','Admin','2025-05-03 07:33:06','2025-05-08 09:26:39'),('USER100002','user','$2b$10$ncroqorpfMcR3Hstr5zbcelADeOBSZ5bBqpsdBq13EpKFY7ygCRCa','user@example.com','User','2025-05-03 07:33:08','2025-05-05 14:21:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visa_types`
--

DROP TABLE IF EXISTS `visa_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visa_types` (
  `id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `requirements` text NOT NULL,
  `country_code` char(2) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visa_types`
--

LOCK TABLES `visa_types` WRITE;
/*!40000 ALTER TABLE `visa_types` DISABLE KEYS */;
INSERT INTO `visa_types` VALUES ('bb3c4efc-58c9-4f5f-8dc9-fd4063003173','Tourist','30','Passport, photo','DR','Congo');
/*!40000 ALTER TABLE `visa_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08 14:53:54
