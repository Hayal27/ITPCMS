const con = require('../models/db');

// Add a new queue entry
const addQueue = (req, res) => {
  try {
    // Verify authentication
    if (!req.user?.user_id) {
      console.error("Authentication Error: req.user is missing or incomplete.", req.user);
      return res.status(401).json({ message: "Authentication required" });
    }

    const user_id = req.user.user_id;
    
    const { 
      vehicle_id, 
      station_id, 
      source_id, 
      destination_id, 
      queue_position, 
      seatCapacity, 
      price, 
      status 
    } = req.body;

    // Input validation
    const requiredFields = { vehicle_id, station_id, source_id, destination_id, seatCapacity, price };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error("Validation Error: Missing fields:", missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }

    const query = `
      INSERT INTO queue 
        (user_id, vehicle_id, station_id, source_id, destination_id, queue_position, seatCapacity, price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      user_id,
      vehicle_id,
      station_id,
      source_id,
      destination_id,
      queue_position || null,
      seatCapacity,
      price,
      status || "pending"
    ];

    con.query(query, values, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Error adding vehicle to queue" });
      }
      console.log("Queue record added:", result.insertId);
      res.status(201).json({ 
        message: "Vehicle added to queue successfully", 
        queue_id: result.insertId 
      });
    });
  } catch (error) {
    console.error("Unhandled Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all active vehicles with owner information
const getVehicles = (req, res) => {
  try {
    const query = `
      SELECT 
        v.id, 
        v.plateNo, 
        v.seatCapacity, 
        v.car_owner
      FROM vehicles v
    `;
    
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching vehicles:', err);
        return res.status(500).json({ message: 'Error fetching vehicles' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all active stations
const getStations = (req, res) => {
  try {
    const query = 'SELECT id, name, location FROM stations WHERE status = "active"';
    
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching stations:', err);
        return res.status(500).json({ message: 'Error fetching stations' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all active source locations
const getSources = (req, res) => {
  try {
    const query = 'SELECT id, name, region FROM source WHERE type = "source" AND status = "active"';
    
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching sources:', err);
        return res.status(500).json({ message: 'Error fetching sources' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all active destination locations
const getDestinations = (req, res) => {
  try {
    const query = 'SELECT id, name, region FROM locations WHERE type = "destination" AND status = "active"';
    
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching destinations:', err);
        return res.status(500).json({ message: 'Error fetching destinations' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addQueue,
  getVehicles,
  getStations,
  getSources,
  getDestinations
};