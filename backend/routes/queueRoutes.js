const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  
const {addQueue ,
     getVehicles,
    getStations,
    getSources,
    getDestinations} = require("../controllers/queueController.js");


// router.post('/addQueue', verifyToken, addQueue);
// router.get('/vehicles', verifyToken, getVehicles); // GET /api/vehicles
// router.get('/stations', verifyToken, getStations); // GET /api/stations
// router.get('/sources', verifyToken, getSources); // GET /api/sources
// router.get('/destinations', verifyToken, getDestinations); // GET /api/destinations


module.exports = router;
