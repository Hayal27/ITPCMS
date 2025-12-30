# Newsletter Subscription Database Migration

## Quick Migration Guide

### Option 1: Using MySQL Command Line (Recommended)

```bash
# Navigate to the migrations folder
cd d:\itpccms\backend\ITPCMS\backend\models\migrations

# Run the migration
mysql -u root -p cms < 001_add_subscribers_table.sql
```

### Option 2: Using phpMyAdmin or MySQL Workbench

1. Open phpMyAdmin or MySQL Workbench
2. Select the `cms` database
3. Go to SQL tab
4. Copy and paste the contents of `001_add_subscribers_table.sql`
5. Click "Execute" or "Go"

### Option 3: Using Node.js Script

```bash
# From the backend directory
cd d:\itpccms\backend\ITPCMS\backend
node run-migration.js
```

## What This Migration Does

✅ Creates the `subscribers` table with:
- `id` - Auto-incrementing primary key
- `email` - Unique email address (varchar 255)
- `status` - Subscription status (active/unsubscribed)
- `subscribed_at` - Timestamp when user subscribed
- `unsubscribed_at` - Timestamp when user unsubscribed (nullable)

✅ Adds proper indexes:
- Primary key on `id`
- Unique constraint on `email`

✅ Uses `CREATE TABLE IF NOT EXISTS` to prevent errors if table already exists

## Verify Migration Success

After running the migration, verify it worked:

```sql
-- Check if table exists
SHOW TABLES LIKE 'subscribers';

-- View table structure
DESCRIBE subscribers;

-- Check for any data
SELECT COUNT(*) FROM subscribers;
```

## Rollback (if needed)

If you need to remove the subscribers table:

```sql
DROP TABLE IF EXISTS subscribers;
```

## Next Steps

After successful migration:

1. ✅ Start the backend server: `node server.js`
2. ✅ Test subscription via the website footer
3. ✅ Check the admin dashboard to view subscribers
4. ✅ Configure email settings in `.env` file

## Troubleshooting

**Error: Table already exists**
- This is safe to ignore if using `CREATE TABLE IF NOT EXISTS`
- The migration won't modify existing data

**Error: Access denied**
- Check your MySQL credentials
- Ensure you have CREATE TABLE permissions

**Error: Database not found**
- Make sure the `cms` database exists
- Create it with: `CREATE DATABASE cms;`
