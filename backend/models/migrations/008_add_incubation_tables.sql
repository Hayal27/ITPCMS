-- Migration: Add Incubation Tables
-- Description: Creates tables for incubation programs and success stories

CREATE TABLE IF NOT EXISTS incubation_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incubation_success_stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description JSON,
    stats JSON,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data for Programs
INSERT INTO incubation_programs (title, icon, description, link) VALUES 
('Startup Support', 'FaRocket', 'Office spaces, mentorship, and pitch events to accelerate your growth journey.', '/incubation/startups'),
('Capacity Building', 'FaGraduationCap', 'Intensive workshops, bootcamps, and training programs to upskill your team.', '/incubation/training'),
('Innovation Labs', 'FaLaptopCode', 'Access to state-of-the-art labs, funding, and corporate collaborations.', '/incubation/innovation-programs');

-- Seed initial data for Success Stories
INSERT INTO incubation_success_stories (image_url, title, description, stats, link) VALUES 
('https://res.cloudinary.com/yesuf/image/upload/v1758529700/1758004298340_akccou.jpg', 'IE Network Solutions', 
'["A leading tech company delivering impactful solutions.", "Award-winning digital transformation partner."]', 
'[{"number": "250+", "label": "Completed Projects"}, {"number": "200+", "label": "Clients Served"}, {"number": "500M+ ETB", "label": "Annual Revenue"}]', 
'/incubation/startups/success'),
('https://res.cloudinary.com/yesuf/image/upload/v1747295344/kagool_ev8nkh.jpg', 'Kagool PLC', 
'["A leading global data & analytics consultancy, delivering digital transformation for enterprises.", "Located at 2nd Floor, BPO Building, Information Technology Park, Addis Ababa, Ethiopia.", "Discover more on their website: kagool.com/about-us"]', 
'[{"number": "Global", "label": "Presence"}, {"number": "20+ Years", "label": "Experience"}]', 
'https://www.kagool.com/about-us'),
('https://res.cloudinary.com/yesuf/image/upload/v1747295683/unin_duld3y.jpg', 'UNIDO Ethiopia', 
'["The United Nations Industrial Development Organization (UNIDO) drives inclusive and sustainable industrial development.", "Active in Ethiopia\'s IT Park, supporting innovation and industrial growth.", "Learn more: unido.org/about-us/who-we-are"]', 
'[{"number": "170+", "label": "Member States"}, {"number": "1966", "label": "Established"}]', 
'https://www.unido.org/about-us/who-we-are');
