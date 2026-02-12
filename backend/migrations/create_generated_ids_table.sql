
CREATE TABLE IF NOT EXISTS `generated_ids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_type` varchar(50) NOT NULL COMMENT 'users, board, applicants',
  `content_id` int(11) NOT NULL,
  `id_no` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Ethiopian',
  `date_of_issue` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
