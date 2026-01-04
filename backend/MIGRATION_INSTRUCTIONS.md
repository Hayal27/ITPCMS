# Board Members & Who We Are Migration Guide

## The migration SQL file is located at:
`models/migrations/009_add_board_and_who_we_are.sql`

## To run this migration on your remote database:

### Option 1: Using phpMyAdmin or MySQL Workbench
1. Open your database management tool
2. Connect to database: `starteut_itp_cmsup`
3. Open and execute the file: `models/migrations/009_add_board_and_who_we_are.sql`

### Option 2: Using MySQL command line
```bash
mysql -h YOUR_HOST -u YOUR_USER -p starteut_itp_cmsup < models/migrations/009_add_board_and_who_we_are.sql
```

### Option 3: Copy and paste the SQL
Open `models/migrations/009_add_board_and_who_we_are.sql` and copy all the SQL commands, then paste and execute them in your database tool.

## What this migration does:
- Creates `board_members` table
- Creates `who_we_are_sections` table  
- Inserts 12 board members with their information
- Inserts 6 "Who We Are" content sections

## After running the migration:
The following endpoints will work:
- GET `/api/about/board-members` - Returns all board members
- GET `/api/about/who-we-are` - Returns all who we are sections
- Admin pages at `/content/board-members` and `/content/who-we-are`
