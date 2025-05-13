const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  
const {
    updatePaymentStatus,updateQueueStatus,getBookingHistory,
    getTariffById,
    createTariff,
    updateTariff,
    updateTariffStatus,
    deleteTariff,bookTicketsMass,bookTiket,getActiveQueues,getQueues,getTariffs,getEmployees,getVehicles,addQueue,addTariff,addVehicles} = require("../controllers/VehicleController");


router.post('/addvehicle', verifyToken, addVehicles);
// router.get('/vehicles', verifyToken, getAllVehicles); // GET /api/vehicles

router.post ('/addTariff',  verifyToken, addTariff);
//addQueue
router.post('/addQueues',  verifyToken, addQueue);
module.exports = router;
// update queue status
router.put('/updatequeuestatus/:id/status',verifyToken,updateQueueStatus)
//Payment Status Update

router.put('/updatepaymentstatus/:id/payment-status',verifyToken,updatePaymentStatus)


//bookTiket 
router.post('/bookTiket',  verifyToken, bookTiket);
router.post('/bookTicketsMass',  verifyToken, bookTicketsMass);
router.get('/getBookingHistory',verifyToken,getBookingHistory)
// get functions
router.get('/getVehicle', verifyToken, getVehicles);
router.get('/getEmployee', verifyToken, getEmployees);
router.get('/getQueues', verifyToken, getQueues);
router.get('/getActiveQueues', verifyToken, getActiveQueues); // GET /


router.get('/getTariff',verifyToken,getTariffs)
router.get('/getTariffById/:id',verifyToken,getTariffById)
router.put('/updateTariff/:id',verifyToken,updateTariff)
router.put('/updateTariffStatus/:id',verifyToken,updateTariffStatus)
router.delete('/deleteTariff/:id', verifyToken, deleteTariff);

