const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function updateMenu() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cms_up',
        port: parseInt(process.env.DB_PORT || "3306", 10),
    });

    try {
        const [result] = await connection.execute(
            "UPDATE menus SET path = '/users/all?add=true' WHERE path = '/users/add'"
        );
        console.log(`Updated ${result.affectedRows} menu items.`);
    } catch (error) {
        console.error('Error updating menu:', error);
    } finally {
        await connection.end();
    }
}

updateMenu();
