-- Fix Parent IDs for menus to match Section hierarchy
-- Sections are: 1 (App), 2 (Content), 3 (Media), 4 (Interaction), 5 (Appearance), 6 (Users), 7 (Settings)

-- Dashboard (ID 8) -> App (ID 1)
UPDATE cms_menus SET parent_id = 1 WHERE id = 8;

-- Content Items -> Content (ID 2)
UPDATE cms_menus SET parent_id = 2 WHERE id = 11; -- Posts
UPDATE cms_menus SET parent_id = 2 WHERE id = 14; -- Gallery
UPDATE cms_menus SET parent_id = 2 WHERE title IN ('Pages', 'Categories', 'Tags', 'Offices', 'Leased Lands', 'Live Events', 'Careers', 'Partners & Investors', 'Incubation', 'Trainings', 'Investment Steps', 'Board Members', 'Who We Are') AND parent_id IS NULL;

-- Media Items -> Media (ID 3)
UPDATE cms_menus SET parent_id = 3 WHERE title = 'Library' AND parent_id IS NULL;

-- Interaction Items -> Interaction (ID 4)
UPDATE cms_menus SET parent_id = 4 WHERE id IN (32, 33); -- Contact, Forms
UPDATE cms_menus SET parent_id = 4 WHERE title = 'Comments' AND parent_id IS NULL;

-- Appearance Items -> Appearance (ID 5)
UPDATE cms_menus SET parent_id = 5 WHERE title IN ('Menus', 'Theme') AND parent_id IS NULL;

-- Users Items -> Users (ID 6)
UPDATE cms_menus SET parent_id = 6 WHERE title IN ('Users', 'Add User', 'Subscribers') AND parent_id IS NULL;

-- Settings Items -> Settings (ID 7)
UPDATE cms_menus SET parent_id = 7 WHERE title IN ('Settings', 'Audit Logs') AND parent_id IS NULL;

-- Add Missing "Role Management" to Users section
INSERT INTO `cms_menus` (`title`, `path`, `icon`, `color`, `parent_id`, `order_index`) VALUES 
('Roles', '/users/roles', '<svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" /></svg>', 'indigo', 6, 74);

-- Ensure Admin has permission for the new item
INSERT INTO `role_menu_permissions` (`role_id`, `menu_id`)
SELECT 1, id FROM `cms_menus` WHERE title = 'Roles' AND parent_id = 6;
