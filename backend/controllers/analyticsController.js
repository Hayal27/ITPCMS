const db = require('../models/db');

/**
 * Get core statistics for the dashboard
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT COUNT(*) as count FROM users');
        const [news] = await db.promise().query('SELECT COUNT(*) as count FROM news');
        const [comments] = await db.promise().query('SELECT COUNT(*) as count FROM comments');
        const [pendingComments] = await db.promise().query('SELECT COUNT(*) as count FROM comments WHERE approved = 0');
        const [subscribers] = await db.promise().query('SELECT COUNT(*) as count FROM subscribers WHERE status = "active"');
        const [inquiries] = await db.promise().query('SELECT COUNT(*) as count FROM investor_inquiries WHERE status = "pending"');
        const [messages] = await db.promise().query('SELECT COUNT(*) as count FROM contact_messages WHERE status = "new"');

        res.json({
            success: true,
            data: {
                totalUsers: users[0].count,
                totalPosts: news[0].count,
                totalComments: comments[0].count,
                pendingComments: pendingComments[0].count,
                activeSubscribers: subscribers[0].count,
                pendingInquiries: inquiries[0].count,
                newMessages: messages[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get monthly data for charts (example: news posts per month)
 */
exports.getMonthlyGrowth = async (req, res) => {
    try {
        const [newsGrowth] = await db.promise().query(`
            SELECT 
                DATE_FORMAT(createdAt, '%M') as month, 
                COUNT(*) as count 
            FROM news 
            GROUP BY MONTH(createdAt), month
            ORDER BY MONTH(createdAt)
        `);

        const [userGrowth] = await db.promise().query(`
            SELECT 
                DATE_FORMAT(created_at, '%M') as month, 
                COUNT(*) as count 
            FROM users 
            GROUP BY MONTH(created_at), month
            ORDER BY MONTH(created_at)
        `);

        res.json({
            success: true,
            data: {
                newsGrowth,
                userGrowth
            }
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
