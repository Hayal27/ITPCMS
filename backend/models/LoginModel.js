
const con = require('./db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

// Secret key (as specified in your requirements)
const JWT_SECRET_KEY = 'hayaltamrat@27'; 

// Function to handle login
const getLogin = async (req, res) => {
    const { user_name, pass } = req.body;
    
    // Validate that pass is provided
    if (!pass) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }
    
    // Updated query: join employees table using employee_id present in users table 
    const query = `
      SELECT u.*, e.*
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      WHERE u.user_name = ?
    `;
    
    con.query(query, [user_name], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // Validate that user object has the password hash
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'User password not set' });
        }

        try {
            const passwordMatch = await bcrypt.compare(pass, user.password);
            if (passwordMatch && user.status === '1') {
                // Update user online status
                con.query('UPDATE users SET online_flag=? WHERE user_id=?', [1, user.user_id], (error) => {
                    if (error) {
                        console.error('Error updating online status:', error);
                        return res.status(500).json({ success: false, message: 'Error updating online status' });
                    }
                });

                // Generate a JWT token with a 400h expiration
                const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, JWT_SECRET_KEY, { expiresIn: '400h' });

                return res.status(200).json({ success: true, token, user });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.status(500).json({ success: false, message: 'Error validating credentials' });
        }
    });
};

// Function to handle logout
const logout = (req, res) => {
    const id = req.params.user_id;

    // Update user's online_flag to 0 to indicate logout
    con.query('UPDATE users SET online_flag=? WHERE user_id=?', [0, id], (error, results) => {
        if (error) {
            console.error('Error updating logout status:', error);
            return res.status(500).send({ message: "Error updating logout status", error: error.message });
        } else {
            console.log('Logout status updated successfully', results);
            return res.status(200).send({ message: 'Logout successful' });
        }
    });
};

module.exports = { getLogin, logout };
