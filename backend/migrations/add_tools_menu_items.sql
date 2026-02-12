-- Add Tools Section and Menu Items to Database
-- This script adds ID Card Registry and ID Generator to the menu system
-- so they can be controlled via role/user permissions

-- Step 1: Create Tools Section (if not exists)
INSERT INTO menus (title, label, path, icon, color, parent_id, order_index, is_section, is_dropdown, is_active)
VALUES ('TOOLS', 'Tools', NULL, NULL, NULL, NULL, 900, 1, 0, 1)
ON DUPLICATE KEY UPDATE title = 'TOOLS';

-- Get the Tools section ID
SET @tools_section_id = LAST_INSERT_ID();

-- Step 2: Add ID Card Registry Menu Item
INSERT INTO menus (title, label, path, icon, color, parent_id, order_index, is_section, is_dropdown, is_active)
VALUES ('ID Card Registry', 'ID Card Registry', '/users/manage-employees', 'fas fa-users-cog', 'blue', @tools_section_id, 901, 0, 0, 1)
ON DUPLICATE KEY UPDATE 
  path = '/users/manage-employees',
  icon = 'fas fa-users-cog',
  color = 'blue',
  parent_id = @tools_section_id;

-- Get ID Card Registry menu ID
SET @id_card_menu_id = LAST_INSERT_ID();

-- Step 3: Add ID Generator Menu Item
INSERT INTO menus (title, label, path, icon, color, parent_id, order_index, is_section, is_dropdown, is_active)
VALUES ('ID Generator', 'ID Generator', '/tools/id-generator', 'fas fa-id-card', 'indigo', @tools_section_id, 902, 0, 0, 1)
ON DUPLICATE KEY UPDATE 
  path = '/tools/id-generator',
  icon = 'fas fa-id-card',
  color = 'indigo',
  parent_id = @tools_section_id;

-- Get ID Generator menu ID
SET @id_generator_menu_id = LAST_INSERT_ID();

-- Step 4: Grant permissions to Admin role (role_id = 1)
INSERT INTO role_menu_permissions (role_id, menu_id)
SELECT 1, id FROM menus WHERE path IN ('/users/manage-employees', '/tools/id-generator')
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Step 5: Grant permissions to HR role (role_id = 4) - Optional, remove if not needed
-- Uncomment the lines below if HR should have access to these tools
-- INSERT INTO role_menu_permissions (role_id, menu_id)
-- SELECT 4, id FROM menus WHERE path IN ('/users/manage-employees', '/tools/id-generator')
-- ON DUPLICATE KEY UPDATE role_id = role_id;

-- Verification Query
SELECT 
  m.id,
  m.title,
  m.path,
  m.icon,
  m.color,
  m.is_section,
  m.parent_id,
  (SELECT title FROM menus WHERE id = m.parent_id) as parent_title,
  GROUP_CONCAT(DISTINCT rmp.role_id) as permitted_roles
FROM menus m
LEFT JOIN role_menu_permissions rmp ON m.id = rmp.menu_id
WHERE m.path IN ('/users/manage-employees', '/tools/id-generator') 
   OR m.title = 'TOOLS'
GROUP BY m.id
ORDER BY m.order_index;

-- Show which users will see these menus
SELECT 
  u.user_id,
  u.user_name,
  u.name,
  r.role_name,
  GROUP_CONCAT(DISTINCT m.title) as accessible_tools
FROM users u
JOIN roles r ON u.role_id = r.role_id
LEFT JOIN role_menu_permissions rmp ON r.role_id = rmp.role_id
LEFT JOIN menus m ON rmp.menu_id = m.id
WHERE m.path IN ('/users/manage-employees', '/tools/id-generator')
GROUP BY u.user_id
ORDER BY r.role_id, u.user_name;
