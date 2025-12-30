
const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cms',
    port: process.env.DB_PORT || 3306
};

const connection = mysql.createConnection(dbConfig);

const mockTrainings = [
    {
        title: 'Full Stack Web Development Bootcamp',
        image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
        event_date: '2024-07-15',
        duration: '6 Weeks',
        location: 'IT Park, Addis Ababa',
        type: 'Bootcamp',
        instructor: 'Abebe Kebede',
        capacity: 40,
        summary: 'Intensive hands-on bootcamp covering React, Node.js, and cloud deployment.',
        description: 'Detailed curriculum covering HTML, CSS, JavaScript, React, Node.js, Express, and MySQL. Project-based learning with a final real-world deployment.',
        tags: JSON.stringify(['Web', 'Full Stack', 'Bootcamp']),
        link: '/training/webdev-bootcamp',
        status: 'Upcoming'
    },
    {
        title: 'AI & Machine Learning Workshop',
        image_url: '/images/innovations/Innovation Lab.jpeg',
        event_date: '2024-08-10',
        duration: '2 Days',
        location: 'IT Park, Addis Ababa',
        type: 'Workshop',
        instructor: 'Sara Alemu',
        capacity: 30,
        summary: 'Explore practical AI/ML concepts and build your first intelligent app.',
        description: 'Hands-on workshop focusing on Python for ML, scikit-learn basics, and building simple predictive models.',
        tags: JSON.stringify(['AI', 'Machine Learning', 'Workshop']),
        link: '/training/ai-workshop',
        status: 'Upcoming'
    },
    {
        title: 'Entrepreneurship for Startups',
        image_url: '/images/innovations/incubation.jpg',
        event_date: '2024-09-01',
        duration: '1 Week',
        location: 'Virtual',
        type: 'Seminar',
        instructor: 'John Tesfaye',
        capacity: 100,
        summary: 'Learn how to launch, fund, and scale your startup from industry leaders.',
        description: 'Comprehensive seminar covering business planning, MVP development, funding rounds, and scaling strategies for tech startups.',
        tags: JSON.stringify(['Entrepreneurship', 'Startup', 'Seminar']),
        link: '/training/entrepreneurship',
        status: 'Upcoming'
    }
];

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);

    const checkTable = "SHOW TABLES LIKE 'training_workshops'";
    connection.query(checkTable, (err, rows) => {
        if (err) throw err;
        if (rows.length === 0) {
            console.error('Table training_workshops does not exist. Please run migration first.');
            connection.end();
            return;
        }

        const insertQuery = `INSERT INTO training_workshops 
            (title, image_url, event_date, duration, location, type, instructor, capacity, summary, description, tags, link, status) 
            VALUES ?`;

        const values = mockTrainings.map(t => [
            t.title, t.image_url, t.event_date, t.duration, t.location, t.type,
            t.instructor, t.capacity, t.summary, t.description, t.tags, t.link, t.status
        ]);

        connection.query(insertQuery, [values], (error, results) => {
            if (error) {
                console.error('Error inserting mock data:', error);
            } else {
                console.log('Successfully migrated mock data:', results.affectedRows, 'rows inserted.');
            }
            connection.end();
        });
    });
});
