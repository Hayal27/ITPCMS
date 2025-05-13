
const con = require('../models/db'); // Adjust the internal connection module as needed


const addVehicles = (req, res) => {
    try {
        // Verify that the authentication middleware has set req.user with a valid user_id.
        if (!req.user || !req.user.user_id) {
            console.error("Authentication Error: req.user is missing or incomplete.", req.user);
            return res.status(401).json({ message: "Authentication required. Ensure the token is valid and middleware is configured." });
        }
        // Retrieve user ID from middleware attached to req.
        const user_id = req.user.user_id;
        console.log("user_id from token:", user_id);

        // Destructure vehicle properties from request body.
        const { carType, carLevel, plateNo, seatCapacity, plateRegion, side_number, carOwner } = req.body;

        // Validate that all required fields are provided.
        if (!carType || !carLevel || !plateNo || !seatCapacity || !plateRegion || !side_number || !carOwner) {
            console.error("Validation Error: All fields are required. Request body:", req.body);
            return res.status(400).json({ message: "All fields are required" });
        }

        // Construct the SQL insertion query and corresponding values array.
        const query = `INSERT INTO vehicles (carType, vehicle_level, plateNo, seatCapacity, plateRegion, side_number, car_owner)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [carType, carLevel, plateNo, seatCapacity, plateRegion, side_number, carOwner];

        // Execute the query to add a new vehicle record.
        con.query(query, values, (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Error adding vehicle" });
            }
            console.log("Vehicle successfully added with ID:", result.insertId);
            res.status(201).json({ message: "Vehicle added successfully", id: result.insertId });
        });
    } catch (error) {
        console.error("Unhandled Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// add tariff
const addTariff = (req, res) => {
    try {
        // Verify that the authentication middleware has set req.user with a valid user_id.
        if (!req.user || !req.user.user_id) {
            console.error("Authentication Error: req.user is missing or incomplete.", req.user);
            return res.status(401).json({ message: "Authentication required. Ensure the token is valid and middleware is configured." });
        }

        // Destructure properties from request body
        const { id, destination, vehicleLevel, price, description } = req.body;
        // Set source to a constant value of 'City'
        const source = 'City';

        // Validate required input parameters
        if ( !destination || !vehicleLevel || !price) {
            console.error("Validation Error: Missing one or more required tariff parameters.");
            return res.status(400).json({ message: "Missing required tariff parameters." });
        }

        // Construct the SQL insertion query and corresponding values array.
        const query = `
            INSERT INTO tariff (id, source, destination, vehicle_level, price)
            VALUES ( ?,?, ?, ?, ?)
        `;
        const values = [id, source, destination, vehicleLevel, price];

        // Execute the query to add a new tariff record.
        con.query(query, values, (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Error adding tariff" });
            }
            console.log("Tariff successfully added with ID:", result.insertId);
            return res.status(201).json({ message: "Tariff added successfully", id: result.insertId });
        });
    } catch (error) {
        console.error("Unhandled Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};






// Get all tariffs



  const getTariffs = async (req, res) => {
    try {
      const sql = "SELECT *, CAST(price AS CHAR) as price, CAST(vehicle_level AS CHAR) as vehicle_level FROM tariff"; // Ensure price and level are strings like in frontend
      con.query(sql, (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Internal server error", details: err.message });
        }
        // Ensure status is included, provide default if necessary (though DB should handle this ideally)
        const tariffs = results.map(tariff => ({
            ...tariff,
            status: tariff.status || 'pending' // Default to 'pending' if status is null/missing
        }));
        res.json(tariffs);
      });
    } catch (error) {
      console.error("Error in getTariffs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// Get a single tariff by ID
const getTariffById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT *, CAST(price AS CHAR) as price, CAST(vehicle_level AS CHAR) as vehicle_level FROM tariff WHERE id = ?";
    con.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Internal server error", details: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Tariff not found" });
      }
       // Ensure status is included
      const tariff = {
          ...results[0],
          status: results[0].status || 'pending'
      };
      res.json(tariff);
    });
  } catch (error) {
    console.error(`Error in getTariffById for ID ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new tariff
const createTariff = async (req, res) => {
  const { source, destination, vehicle_level, price } = req.body;
  // Default status to 'pending' when creating a new tariff
  const status = 'pending';

  if (!source || !destination || vehicle_level === undefined || price === undefined) {
    return res.status(400).json({ error: "Missing required fields: source, destination, vehicle_level, price" });
  }

  try {
    const sql = "INSERT INTO tariff (source, destination, vehicle_level, price, status) VALUES (?, ?, ?, ?, ?)";
    con.query(sql, [source, destination, vehicle_level, price, status], (err, result) => {
      if (err) {
        console.error("Database insert error:", err);
        // Check for specific errors like duplicate entry if needed
        return res.status(500).json({ error: "Failed to create tariff", details: err.message });
      }
      res.status(201).json({ message: "Tariff created successfully", id: result.insertId });
    });
  } catch (error) {
    console.error("Error in createTariff:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing tariff
const updateTariff = async (req, res) => {
  const { id } = req.params;
  const { source, destination, vehicle_level, price } = req.body;

  if (!source || !destination || vehicle_level === undefined || price === undefined) {
    return res.status(400).json({ error: "Missing required fields: source, destination, vehicle_level, price" });
  }

  try {
    const sql = "UPDATE tariff SET source = ?, destination = ?, vehicle_level = ?, price = ? WHERE id = ?";
    con.query(sql, [source, destination, vehicle_level, price, id], (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ error: "Failed to update tariff", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tariff not found or no changes made" });
      }
      res.json({ message: "Tariff updated successfully" });
    });
  } catch (error) {
    console.error(`Error in updateTariff for ID ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update tariff status
const updateTariffStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'pending', 'deactivated'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const sql = "UPDATE tariff SET status = ? WHERE id = ?";
        con.query(sql, [status, id], (err, result) => {
            if (err) {
                console.error("Database update error:", err);
                return res.status(500).json({ error: "Failed to update tariff status", details: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Tariff not found" });
            }
            res.json({ message: `Tariff status updated to ${status}` });
        });
    } catch (error) {
        console.error(`Error in updateTariffStatus for ID ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Delete a tariff
const deleteTariff = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM tariff WHERE id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Database delete error:", err);
        return res.status(500).json({ error: "Failed to delete tariff", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tariff not found" });
      }
      res.json({ message: "Tariff deleted successfully" });
    });
  } catch (error) {
    console.error(`Error in deleteTariff for ID ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};
  
  // Get all employees
  const getEmployees = async (req, res) => {
    try {
      const sql = "SELECT * FROM employees";
      con.query(sql, (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
      });
    } catch (error) {
      console.error("Error in getEmployees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Get all vehicles
  const getVehicles = async (req, res) => {
    try {
      const sql = "SELECT * FROM vehicles";
      con.query(sql, (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
      });
    } catch (error) {
      console.error("Error in getVehicles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
 
//   getQueues
const getQueues = async (req, res) => {  
    try {  
      const sql = "SELECT * FROM queue";  
      con.query(sql, (err, results) => {  
        if (err) {  
          console.error("Database query error in getQueues:", err);  
          return res.status(500).json({ error: "Internal server error" });  
        }  
        res.json(results);  
      });  
    } catch (error) {  
      console.error("Error in getQueues:", error);  
      res.status(500).json({ error: "Internal server error" });  
    }  
  };

  // updateQueueStatus
  
  // updateQueueStatus
  const updateQueueStatus = async (req, res) => {
    try {
      const { id } = req.params; // Get queue ID from URL parameters (e.g., /api/queues/:id/status)
      const { status } = req.body; // Get new status from request body

      if (!id || !status) {
        return res.status(400).json({ error: "Queue ID and status are required" });
      }

      // Validate the status value against allowed options
      const validStatuses = ['active', 'cancelled', 'completed', 'inactive', 'departed']; // Add any other valid statuses
      if (!validStatuses.includes(status.toLowerCase())) { // Convert to lowercase for case-insensitive check
          return res.status(400).json({ error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` });
      }

      const sql = "UPDATE queue SET status = ? WHERE id = ?";
      con.query(sql, [status, id], (err, result) => {
        if (err) {
          console.error("Database query error in updateQueueStatus:", err);
          return res.status(500).json({ error: "Internal server error updating queue status" });
        }

        if (result.affectedRows === 0) {
          // No rows were updated, meaning the queue ID might not exist
          return res.status(404).json({ error: `Queue with ID ${id} not found` });
        }

        // Successfully updated
        console.log(`Queue ${id} status updated to ${status}`);
        res.json({ message: `Queue ${id} status updated successfully to ${status}` });
      });
    } catch (error) {
      console.error("Error in updateQueueStatus:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


// add queue
const addQueue = async (req, res) => {
    try {
      if (!req.user?.user_id) {
        console.error("Authentication Error: req.user is missing or incomplete.", req.user);
        return res.status(401).json({ message: "Authentication required" });
      }
  
      const user_id = req.user.user_id;
      const { plateNo, employeeId, tariffId } = req.body;
  
      if (!plateNo || !employeeId || !tariffId) {
        console.error("Validation Error: Missing plateNo, employeeId, or tariffId", req.body);
        return res.status(400).json({ message: "plateNo, employeeId, and tariffId are required" });
      }
  
      const queryPromise = (sql, values) => {
        return new Promise((resolve, reject) => {
          con.query(sql, values, (error, results) => {
            if (error) {
              console.error(`Database Query Error: SQL: ${sql} | Values: ${JSON.stringify(values)} | Error: ${error.message}`);
              return reject(error);
            }
            resolve(results);
          });
        });
      };
  
      // Get vehicle by plate number
      const vehicleQuery = "SELECT * FROM vehicles WHERE plateNo = ?";
      const vehicleResults = await queryPromise(vehicleQuery, [plateNo]);
      if (!vehicleResults.length) {
        console.error(`Vehicle not found for plateNo: ${plateNo}`);
        return res.status(404).json({ message: "Vehicle not found" });
      }
  
      // Verify employee exists
      const employeeQuery = "SELECT * FROM employees WHERE employee_id = ?";
      const employeeResults = await queryPromise(employeeQuery, [employeeId]);
      if (!employeeResults.length) {
        console.error(`Employee not found for id: ${employeeId}`);
        return res.status(404).json({ message: "Employee not found" });
      }
  
      // Verify tariff exists
      const tariffQuery = "SELECT * FROM tariff WHERE id = ?";
      const tariffResults = await queryPromise(tariffQuery, [tariffId]);
      if (!tariffResults.length) {
        console.error(`Tariff not found for id: ${tariffId}`);
        return res.status(404).json({ message: "Tariff not found" });
      }
  
      // Insert into queue table using employee_id directly as agent
      const insertQuery = `
        INSERT INTO queue (user_id, vehicle_id, agent, tariff, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      const insertValues = [
        user_id,
        vehicleResults[0].id,
        employeeId, // insert employee_id into agent field
        tariffResults[0].id,
        "active",
      ];
  
      const insertResult = await queryPromise(insertQuery, insertValues);
  
      console.log("Queue record added with id:", insertResult.insertId);
      res.status(201).json({
        message: "Vehicle added to queue successfully",
        queue_id: insertResult.insertId,
      });
  
    } catch (error) {
      console.error("Unhandled Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  // getActiveQueues

  const getActiveQueues = async (req, res) => {
    try {
      // Assuming the authenticated token provides the user_id as req.user.user_id
      const userId = req.user && req.user.user_id;
      if (!userId) {
        return res.status(400).json({ error: 'User ID not provided in auth context' });
      }

      // First, fetch the employee_id from the database based on the current user_id.
      const employeeSql = `
        SELECT e.employee_id
        FROM employees e
        JOIN users u ON e.employee_id = u.employee_id
        WHERE u.user_id = ?
      `;

      con.query(employeeSql, [userId], (empErr, empResults) => {
        if (empErr) {
          console.error("Database query error in getActiveQueues (employee lookup):", empErr);
          return res.status(500).json({ error: "Internal server error during employee lookup" });
        }
        if (empResults.length === 0) {
          return res.status(400).json({ error: 'Employee ID not found for the current user' });
        }
        const employeeId = empResults[0].employee_id;

        // Now, use the obtained employee_id to retrieve active queues, including booked and remaining seats
        const queueSql = `
          SELECT
            q.payment_status,
            q.id,
            q.vehicle_id,
            q.tariff,
            q.status,
            q.agent,
            q.created_at,
            v.plateNo,
            v.seatCapacity,
            v.plateRegion,
            v.vehicle_level,
            t.source,
            t.destination,
            t.price AS tariff_price, -- Alias t.price to avoid conflict if needed elsewhere
            COALESCE(COUNT(ti.id), 0) AS booked_seats, -- Count booked ticket for this queue
            (v.seatCapacity - COALESCE(COUNT(ti.id), 0)) AS remaining_seats -- Calculate remaining seats
          FROM queue q
          JOIN vehicles v ON q.vehicle_id = v.id
          JOIN tariff t ON q.tariff = t.id
          LEFT JOIN ticket ti ON q.id = ti.queue_id -- Left join to include queues with 0 bookings
          WHERE q.agent = ?
          GROUP BY q.id -- Group by queue ID to count ticket per queue
        `;

        con.query(queueSql, [employeeId], (queueErr, queueResults) => {
          if (queueErr) {
            console.error("Database query error in getActiveQueues (queue lookup):", queueErr);
            return res.status(500).json({ error: "Internal server error during queue lookup" });
          }
          // Map results to ensure correct data types if necessary (e.g., numbers)
          const finalResults = queueResults.map(row => ({
            ...row,
            booked_seats: parseInt(row.booked_seats, 10),
            remaining_seats: parseInt(row.remaining_seats, 10),
            seatCapacity: parseInt(row.seatCapacity, 10),
            tariff_price: parseFloat(row.tariff_price)
          }));
          res.json(finalResults);
        });
      });
    } catch (error) {
      console.error("Error in getActiveQueues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };



  // Payment Managmet 
// Payment Management
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get queue ID from URL parameters

    // --- FIX 1: Extract using the correct key from the frontend ---
    const { payment_status } = req.body; // Get new status using 'payment_status' key

    // --- FIX 2: Validate the extracted 'payment_status' ---
    if (!id || !payment_status) { // Check if 'payment_status' exists
      return res.status(400).json({ error: "Queue ID and payment_status are required" });
    }

    // Validate the status value against allowed options (use lowercase for consistency)
    const validStatuses = ['approved', 'rejected']; // Use lowercase canonical values
    const lowerCaseStatus = String(payment_status).toLowerCase(); // Ensure it's a string and lowercase

    if (!validStatuses.includes(lowerCaseStatus)) {
        return res.status(400).json({ error: `Invalid payment_status value. Must be one of: ${validStatuses.join(', ')}` });
    }

    // --- FIX 3: Use the correct variable in the SQL query ---
    const sql = "UPDATE queue SET payment_status = ? WHERE id = ?";
    // Pass the validated lowercase status to the query
    con.query(sql, [lowerCaseStatus, id], (err, result) => {
      if (err) {
        console.error("Database query error in updatePaymentStatus:", err);
        return res.status(500).json({ error: "Internal server error updating queue payment status" });
      }

      if (result.affectedRows === 0) {
        // No rows were updated, meaning the queue ID might not exist
        return res.status(404).json({ error: `Queue with ID ${id} not found` });
      }

      // Successfully updated
      console.log(`Queue ${id} payment status updated to ${lowerCaseStatus}`);
      // Send back the confirmed status
      res.json({ message: `Queue ${id} payment status updated successfully to ${lowerCaseStatus}` });
    });
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




// initiating payment 











  // bookTiket
  const bookTiket = async (req, res) => {
    try {
        // Authentication check
        if (!req.user || !req.user.user_id) {
            console.error("Authentication Error: req.user is missing or incomplete.", req.user);
            return res.status(401).json({ message: "Authentication required. Ensure the token is valid and middleware is configured." });
        }
        const user_id = req.user.user_id;

        // Input validation
        const { queueId, passengerName } = req.body;
        if (!queueId || !passengerName || !passengerName.trim()) {
            console.error("Validation Error: queueId and passengerName are required.", req.body);
            return res.status(400).json({ message: "queueId and passengerName are required." });
        }

        // Helper for async/await with MySQL
        const queryPromise = (sql, values) => {
            return new Promise((resolve, reject) => {
                con.query(sql, values, (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        };

        // 1. Check if the queue exists and get vehicle_id
        const queueRows = await queryPromise("SELECT * FROM queue WHERE id = ?", [queueId]);
        if (!queueRows.length) {
            return res.status(404).json({ message: "Queue not found." });
        }
        const queue = queueRows[0];
        const vehicleId = queue.vehicle_id;

        // 2. Get vehicle seat capacity
        const vehicleRows = await queryPromise("SELECT seatCapacity FROM vehicles WHERE id = ?", [vehicleId]);
        if (!vehicleRows.length) {
            return res.status(404).json({ message: "Vehicle not found for this queue." });
        }
        const seatCapacity = parseInt(vehicleRows[0].seatCapacity, 10);

        // 3. Count current ticket for this queue (to determine seat_number)
        const ticketRows = await queryPromise("SELECT COUNT(*) AS count FROM ticket WHERE queue_id = ?", [queueId]);
        const currentTicket = ticketRows[0].count;

        // 4. Prevent overbooking
        if (currentTicket >= seatCapacity) {
            return res.status(400).json({ message: "All seats are booked for this vehicle." });
        }

        // 5. Assign next seat number (1-based)
        const seat_number = currentTicket + 1;

        // 6. Insert ticket
        const created_at = new Date();
        const insertSql = `
            INSERT INTO ticket (queue_id, user_id, passenger_name, seat_number, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const insertValues = [queueId, user_id, passengerName.trim(), seat_number, created_at];

        const insertResult = await queryPromise(insertSql, insertValues);

        // 7. Success response
        return res.status(201).json({
            message: "Ticket booked successfully.",
            ticket_id: insertResult.insertId,
            seat_number,
            created_at
        });

    } catch (error) {
        console.error("Unhandled Error in bookTiket:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// getBookingHistory
// Helper for async/await with MySQL (assuming it's available in the scope or defined earlier)


// getBookingHistory (Detailed)
const getBookingHistory = async (req, res) => {
  try {
      // 1. Authentication check
      if (!req.user || !req.user.user_id) {
          console.error("Authentication Error: req.user is missing or incomplete.", req.user);
          return res.status(401).json({ message: "Authentication required. Ensure the token is valid and middleware is configured." });
      }
      const user_id = req.user.user_id;

      // 2. Query database for user's tickets with detailed fields
      // !!! IMPORTANT: Verify the JOIN condition 'q.tariff = tr.id' matches your database schema !!!
      // This assumes the 'queue' table has a 'tariff' column that is a foreign key to 'tariff.id'.
      // Adjust the JOINs below if your schema links these tables differently.
      const sql = `
          SELECT
              -- Ticket Details
              t.id AS ticket_id,
              t.passenger_name,
              t.seat_number,
              t.price AS ticket_price, -- Original ticket price if needed, distinct from tariff price
              t.status AS ticket_status,
              t.created_at AS booking_time,
              t.updated_at AS ticket_updated_at,

              -- Queue Details (Include if needed for other purposes)
              q.id AS queue_id,
              q.status AS queue_status,

              -- Vehicle Details
              v.id AS vehicle_id,
              v.plateNo,
              v.seatCapacity AS vehicle_seat_capacity,
              v.plateRegion,
              v.vehicle_level,

              -- Tariff Details (Joined via Queue - VERIFY THIS JOIN)
              tr.id AS tariff_id,
              tr.source,
              tr.destination,
              tr.price AS tariff_price -- Price based on the route/tariff

          FROM ticket t
          JOIN queue q ON t.queue_id = q.id
          JOIN vehicles v ON q.vehicle_id = v.id
          -- !!! VERIFY THIS JOIN CONDITION !!!
          LEFT JOIN tariff tr ON q.tariff = tr.id -- Using LEFT JOIN in case tariff link is optional/missing
          WHERE t.user_id = ?
          ORDER BY t.created_at DESC
      `;

      // Use the existing queryPromise function
      const bookingHistory = await queryPromise(sql, [user_id]);

      // 3. Success response - Send the fetched data
      // The frontend 'BookingHistory.jsx' uses:
      // ticket_id, passenger_name, plateNo, seat_number, source, destination, tariff_price, booking_time
      // All these fields are included in the SELECT statement above.
      return res.status(200).json(bookingHistory);

  } catch (error) {
      console.error("Error in getBookingHistory:", error);
      // Log the specific SQL error if available
      if (error.sqlMessage) {
          console.error("SQL Error:", error.sqlMessage);
          console.error("Faulty SQL:", error.sql); // Log the actual SQL query that failed
      }
      return res.status(500).json({ message: "Internal server error while fetching booking history." });
  }
};


// Assuming queryPromise is defined elsewhere in the file or imported
// Example definition based on provided context:
const queryPromise = (sql, values) => {
  return new Promise((resolve, reject) => {
      // Assuming 'con' is your database connection object
      con.query(sql, values, (error, results) => {
          if (error) {
              // Attach the failed SQL to the error object for better debugging
              error.sql = sql;
              return reject(error);
          }
          resolve(results);
      });
  });
};

// Assuming queryPromise is defined elsewhere in the file or imported
// Example definition based on provided context:



const bookTicketsMass = async (req, res) => {
  // Assuming 'con' is your database connection object/pool
  // let connection; // Uncomment if using connection pooling and transactions

  // Helper function for promisified queries (adapt if using a pool)
  const queryPromise = (sql, values) =>
    new Promise((resolve, reject) => {
      // const db = connection || con; // Use connection if available
      con.query(sql, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

  try {
    // --- Optional: Start Transaction ---
    // connection = await con.getConnection(); // Get connection from pool
    // await queryPromise('START TRANSACTION');

    // 1. Auth
    if (!req.user || !req.user.user_id) {
      // if (connection) await queryPromise('ROLLBACK');
      return res.status(401).json({ message: "Authentication required." });
    }
    const user_id = req.user.user_id;

    // 2. Input validation
    const { queueId, passengerNames } = req.body;
    if (
      !queueId ||
      !Array.isArray(passengerNames) ||
      passengerNames.length === 0
    ) {
      console.error("Validation Error: queueId and non-empty passengerNames array required.", req.body);
      // if (connection) await queryPromise('ROLLBACK');
      return res.status(400).json({
        message: "queueId and a non-empty passengerNames array are required."
      });
    }
    const num = passengerNames.length;

    // 4. Check queue exists and get vehicle_id
    const queueRows = await queryPromise(
      "SELECT vehicle_id FROM queue WHERE id = ?",
      [queueId]
    );
    if (!queueRows.length) {
      // if (connection) await queryPromise('ROLLBACK');
      return res.status(404).json({ message: "Queue not found." });
    }
    const vehicleId = queueRows[0].vehicle_id;

    // 5. Seat capacity
    const vehicleRows = await queryPromise(
      "SELECT seatCapacity FROM vehicles WHERE id = ?",
      [vehicleId]
    );
    if (!vehicleRows.length) {
      // if (connection) await queryPromise('ROLLBACK');
      return res.status(404).json({ message: "Vehicle not found." });
    }
    const seatCapacity = parseInt(vehicleRows[0].seatCapacity, 10);

    // 6. Current booked count (Consider FOR UPDATE for high concurrency with transactions)
    const ticketRows = await queryPromise(
      "SELECT COUNT(*) AS cnt FROM ticket WHERE queue_id = ?", // Add 'FOR UPDATE' if using transactions
      [queueId]
    );
    const currentCount = ticketRows[0].cnt;
    const available = seatCapacity - currentCount;
    if (num > available) {
      // if (connection) await queryPromise('ROLLBACK');
      return res.status(400).json({
        message: `Only ${available} seats available for Queue ID ${queueId}. Cannot book ${num}.`
      });
    }

    // 7. Prepare bulk insert values
    const now = new Date();
    const startSeat = currentCount + 1;
    const rows = passengerNames.map((name, idx) => {
      const seat_number = startSeat + idx;
      // Sanitize/validate name input
      const passengerName = name ? String(name).trim().substring(0, 255) : `Passenger ${idx + 1}`;
      return [queueId, user_id, passengerName, seat_number, now];
    });

    // 8. Bulk insert
    const insertResult = await queryPromise(
      `INSERT INTO ticket
         (queue_id, user_id, passenger_name, seat_number, created_at)
       VALUES ?`,
      [rows]
    );

    // Verify insertion count
    if (insertResult.affectedRows !== num) {
        console.error(`Mass insert failed or partially failed for queue ${queueId}. Expected ${num}, inserted ${insertResult.affectedRows}`);
        // if (connection) await queryPromise('ROLLBACK');
        // Consider attempting cleanup or just report error
        return res.status(500).json({ message: "Failed to insert all tickets accurately. Please check manually." });
    }

    // --- Retrieve the details of the newly inserted tickets ---
    const endSeat = currentCount + num;
    const newlyBookedTickets = await queryPromise(
        `SELECT
            id,
            queue_id,
            user_id,
            passenger_name,
            seat_number,
            created_at
         FROM ticket
         WHERE queue_id = ?
           AND user_id = ?
           AND seat_number >= ?
           AND seat_number <= ?
         ORDER BY seat_number ASC`,
        [queueId, user_id, startSeat, endSeat]
    );

    // --- Optional: Commit Transaction ---
    // if (connection) await queryPromise('COMMIT');

    // 9. Success - Return the details of the booked tickets
    return res.status(201).json({
      message: `${newlyBookedTickets.length} ticket(s) booked successfully.`, // Accurate count
      tickets: newlyBookedTickets.map(ticket => ({ // Map to frontend expected structure
          id: ticket.id,
          queue_id: ticket.queue_id,
          passengerName: ticket.passenger_name, // Map DB name to frontend name
          seat_number: ticket.seat_number,
          // Provide created_at, frontend uses this or booking_time
          created_at: ticket.created_at
          // Price is still expected to be added by the frontend based on queue info
      }))
    });

  } catch (err) {
    console.error("Error in bookTicketsMass:", err);
    // --- Optional: Rollback on any error ---
    // if (connection) {
    //     try { await queryPromise('ROLLBACK'); } catch (rbErr) { console.error('Rollback failed:', rbErr); }
    // }
    return res.status(500).json({ message: err.message || "Internal server error during mass booking." });
  } finally {
      // --- Optional: Release connection if using pooling ---
      // if (connection) {
      //     try { connection.release(); } catch (relErr) { console.error('Failed to release connection:', relErr); }
      // }
  }
};


module.exports = {
  bookTiket,
  bookTicketsMass,
  getBookingHistory,
    getQueues,
    getTariffs,
    getEmployees,
    getVehicles,
    addQueue,
    updateQueueStatus,
    addVehicles,
    addTariff,
    getActiveQueues,   
    getTariffById,
    createTariff,
    updateTariff,
    updateTariffStatus,
    deleteTariff,
    updatePaymentStatus
};


