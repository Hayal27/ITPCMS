-- ============================================
-- Newsletter Subscription System Migration
-- Date: 2025-12-19
-- Description: Adds subscribers table for newsletter functionality
-- ============================================

USE `cms`;

-- --------------------------------------------------------
-- Table structure for table `subscribers`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `status` enum('active','unsubscribed') DEFAULT 'active',
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=1;

-- --------------------------------------------------------
-- Success Message
-- --------------------------------------------------------

SELECT 'Newsletter subscription system migration completed successfully!' AS Status;
