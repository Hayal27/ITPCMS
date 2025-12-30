-- Create faqs table
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert initial data
INSERT INTO `faqs` (`question`, `answer`, `category`, `order`) VALUES
('What is Ethiopian IT Park?', 'Ethiopian IT Park is a state-of-the-art technology hub designed to foster innovation and digital transformation in Ethiopia. Our facility provides world-class infrastructure, support services, and a collaborative environment for tech companies, startups, and entrepreneurs.', 'about', 1),
('What services does IT Park offer to businesses?', 'We offer a comprehensive range of services including: modern office spaces, high-speed internet connectivity, 24/7 power backup, incubation programs, business development support, meeting and conference facilities, and networking opportunities with industry leaders.', 'services', 2),
('How can I invest in Ethiopian IT Park?', 'Investment opportunities at Ethiopian IT Park are open to both local and international investors. The process involves: 1) Submitting an investment proposal, 2) Due diligence review, 3) Approval process, 4) Space allocation and setup. Contact our investment team for detailed information and guidance.', 'investment', 3),
('What are the working hours?', 'The IT Park facility is open 24/7 for registered companies. Administrative offices operate Monday through Friday, 8:30 AM to 5:30 PM EAT.', 'about', 4),
('Is there public transportation to the park?', 'Yes, we have dedicated shuttle services from major hubs in Addis Ababa. Additionally, the park is accessible via public buses and ride-hailing services.', 'community', 5);
